import { extractAndVerifyToken, findOrCreateSubject } from "@/lib/auth";
import config from "@payload-config";
import { NextRequest, NextResponse } from "next/server";
import { getPayload, Where } from "payload";

export async function POST(req: NextRequest) {
  try {
    const auth = await extractAndVerifyToken(req);
    if (auth.error) return auth.error;

    const body = await req.json();
    const { documentId, versionId, status } = body;

    if (!documentId || !versionId || !status) {
      return NextResponse.json(
        { error: "Missing required fields: documentId, versionId, status." },
        { status: 400 },
      );
    }

    if (status !== "granted" && status !== "revoked") {
      return NextResponse.json(
        { error: "Status must be 'granted' or 'revoked'." },
        { status: 400 },
      );
    }

    const payload = await getPayload({ config });
    const subject = await findOrCreateSubject(payload, auth.claims!);

    const statement = await payload.create({
      collection: "statements",
      data: {
        document: documentId,
        subject: subject.id,
        version: versionId,
        status,
      },
      overrideAccess: true,
    });

    const { document, ...rest } = statement;
    return NextResponse.json(rest, { status: 201 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error.";
    const status = (err as { status?: number }).status ?? 500;
    return NextResponse.json({ error: message }, { status });
  }
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
      });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);
    const documentId = searchParams.get("documentId");

    const where: Where = {
      subject: { equals: subject.docs[0].id },
    };

    if (documentId) {
      where.document = { equals: documentId };
    }

    const statements = await payload.find({
      collection: "statements",
      where,
      page,
      limit,
      sort: "-createdAt",
      overrideAccess: true,
    });

    return NextResponse.json(statements);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
