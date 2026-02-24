import { extractAndVerifyToken } from "@/lib/auth";
import config from "@payload-config";
import { NextRequest, NextResponse } from "next/server";
import { getPayload, Where } from "payload";
import { Document } from "../../../../../../../payload-types";

function isValidISODate(value: string): boolean {
  const date = new Date(value);
  return !isNaN(date.getTime());
}

export async function GET(req: NextRequest) {
  try {
    const auth = await extractAndVerifyToken(req);
    if (auth.error) return auth.error;

    const payload = await getPayload({ config });

    const subject = await payload.find({
      collection: "subjects",
      where: { id: { equals: auth.claims!.sub } },
      limit: 1,
      overrideAccess: true,
    });

    if (subject.docs.length === 0) {
      return NextResponse.json({
        docs: [],
        totalDocs: 0,
        page: 1,
        totalPages: 0,
        limit: 20,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
      });
    }

    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get("page") ?? "1";
    const limitParam = searchParams.get("limit") ?? "20";
    const documentType = searchParams.get("documentType");
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const search = searchParams.get("search");

    const page = parseInt(pageParam, 10);
    const limit = parseInt(limitParam, 10);

    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: "Invalid page parameter. Must be a positive integer." },
        { status: 400 },
      );
    }

    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { error: "Invalid limit parameter. Must be a positive integer." },
        { status: 400 },
      );
    }

    if (from && !isValidISODate(from)) {
      return NextResponse.json(
        { error: "Invalid 'from' date format. Use ISO 8601 format." },
        { status: 400 },
      );
    }

    if (to && !isValidISODate(to)) {
      return NextResponse.json(
        { error: "Invalid 'to' date format. Use ISO 8601 format." },
        { status: 400 },
      );
    }

    const validStatuses = ["granted", "revoked"];
    if (status) {
      const statuses = status.split(",").map((s) => s.trim());
      const invalid = statuses.filter((s) => !validStatuses.includes(s));
      if (invalid.length > 0) {
        return NextResponse.json(
          { error: `Invalid status value(s): ${invalid.join(", ")}. Must be 'granted' or 'revoked'.` },
          { status: 400 },
        );
      }
    }

    const subjectId = subject.docs[0].id;
    const where: Where = {
      subject: { equals: subjectId },
    };

    // Filter by status
    if (status) {
      const statuses = status.split(",").map((s) => s.trim());
      if (statuses.length === 1) {
        where.status = { equals: statuses[0] };
      } else {
        where.status = { in: statuses };
      }
    }

    // Filter by document type: find documents matching the type(s), then filter statements
    let documentTypeDocIds: string[] | null = null;
    if (documentType) {
      const typeIds = documentType.split(",").map((id) => id.trim());
      const docs = await payload.find({
        collection: "documents",
        where: { documentType: { in: typeIds } },
        limit: 0,
        overrideAccess: true,
      });
      documentTypeDocIds = docs.docs.map((d) => d.id);
    }

    // Search: find documents by name and versions by content
    let searchDocIds: string[] | null = null;
    let searchVersionIds: string[] | null = null;
    if (search) {
      const [docsByName, versionsByContent] = await Promise.all([
        payload.find({
          collection: "documents",
          where: { name: { like: search } },
          limit: 0,
          overrideAccess: true,
        }),
        payload.find({
          collection: "versions",
          where: { searchContent: { like: search } },
          limit: 0,
          overrideAccess: true,
        }),
      ]);

      searchDocIds = docsByName.docs.map((d) => d.id);
      searchVersionIds = versionsByContent.docs.map((v) => v.id);
    }

    // Combine document ID filters
    if (documentTypeDocIds !== null && (searchDocIds !== null || searchVersionIds !== null)) {
      // When both documentType and search are active:
      // documentType filters by document, search matches document name OR version content
      // Result: statements where document matches type AND (document matches name OR version matches content)
      const searchConditions: Where[] = [];
      if (searchDocIds && searchDocIds.length > 0) {
        const intersection = documentTypeDocIds.filter((id) =>
          searchDocIds!.includes(id),
        );
        if (intersection.length > 0) {
          searchConditions.push({ document: { in: intersection } });
        }
      }
      if (searchVersionIds && searchVersionIds.length > 0) {
        searchConditions.push({
          and: [
            { document: { in: documentTypeDocIds } },
            { version: { in: searchVersionIds } },
          ],
        });
      }

      if (searchConditions.length === 0) {
        return NextResponse.json({
          docs: [],
          totalDocs: 0,
          page,
          totalPages: 0,
          limit,
          hasPrevPage: false,
          hasNextPage: false,
          prevPage: null,
          nextPage: null,
        });
      }
      if (searchConditions.length === 1) {
        Object.assign(where, searchConditions[0]);
      } else {
        where.or = searchConditions;
      }
    } else if (documentTypeDocIds !== null) {
      if (documentTypeDocIds.length === 0) {
        return NextResponse.json({
          docs: [],
          totalDocs: 0,
          page,
          totalPages: 0,
          limit,
          hasPrevPage: false,
          hasNextPage: false,
          prevPage: null,
          nextPage: null,
        });
      }
      where.document = { in: documentTypeDocIds };
    } else if (searchDocIds !== null || searchVersionIds !== null) {
      const searchConditions: Where[] = [];
      if (searchDocIds && searchDocIds.length > 0) {
        searchConditions.push({ document: { in: searchDocIds } });
      }
      if (searchVersionIds && searchVersionIds.length > 0) {
        searchConditions.push({ version: { in: searchVersionIds } });
      }

      if (searchConditions.length === 0) {
        return NextResponse.json({
          docs: [],
          totalDocs: 0,
          page,
          totalPages: 0,
          limit,
          hasPrevPage: false,
          hasNextPage: false,
          prevPage: null,
          nextPage: null,
        });
      }
      if (searchConditions.length === 1) {
        Object.assign(where, searchConditions[0]);
      } else {
        where.or = searchConditions;
      }
    }

    // Date filters
    if (from || to) {
      const createdAt: Record<string, string> = {};
      if (from) createdAt.greater_than_equal = from;
      if (to) createdAt.less_than_equal = to;
      where.createdAt = createdAt;
    }

    // Fetch all matching statements (pagination is applied to date groups, not rows)
    const statements = await payload.find({
      collection: "statements",
      where,
      limit: 0,
      sort: "-createdAt",
      depth: 1,
      overrideAccess: true,
    });

    // Group statements by date
    const grouped = new Map<
      string,
      {
        id: string;
        documentName: string | null;
        statementDate: string;
        status: string;
      }[]
    >();
    for (const statement of statements.docs) {
      const doc = statement.document as Document;
      const date = statement.createdAt.split("T")[0];
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push({
        id: statement.id,
        documentName: doc?.name ?? null,
        statementDate: statement.createdAt,
        status: statement.status,
      });
    }

    const allDateGroups = Array.from(grouped, ([date, items]) => ({
      date,
      items,
    }));

    // Paginate on date groups
    const totalDocs = allDateGroups.length;
    const totalPages = Math.ceil(totalDocs / limit);
    const startIndex = (page - 1) * limit;
    const docs = allDateGroups.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      docs,
      totalDocs,
      page,
      totalPages,
      limit,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const OPTIONS = async (_request: NextRequest) => {
  return new NextResponse("", {
    status: 200,
  });
};
