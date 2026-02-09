import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { verifyExternalJWT } from "@/lib/jwt";

async function extractAndVerifyToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "Missing or invalid Authorization header." }, { status: 401 }) };
  }

  try {
    const token = authHeader.slice(7);
    const claims = await verifyExternalJWT(token);
    return { claims };
  } catch {
    return { error: NextResponse.json({ error: "Invalid or expired token." }, { status: 401 }) };
  }
}

async function findOrCreateSubject(
  payload: Awaited<ReturnType<typeof getPayload>>,
  claims: { sub: string; email: string; given_name: string; family_name: string },
) {
  const existing = await payload.find({
    collection: "subjects",
    where: { id: { equals: claims.sub } },
    limit: 1,
    overrideAccess: true,
  });

  if (existing.docs.length > 0) {
    return existing.docs[0];
  }

  return payload.create({
    collection: "subjects",
    data: {
      id: claims.sub,
      email: claims.email,
      firstName: claims.given_name,
      lastName: claims.family_name,
    },
    overrideAccess: true,
  });
}

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

    if (status !== "granted" && status !== "denied") {
      return NextResponse.json(
        { error: "Status must be 'granted' or 'denied'." },
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

    return NextResponse.json(statement, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error.";
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
      return NextResponse.json({ docs: [], totalDocs: 0, page: 1, totalPages: 0 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);

    const statements = await payload.find({
      collection: "statements",
      where: { subject: { equals: subject.docs[0].id } },
      page,
      limit,
      overrideAccess: true,
    });

    return NextResponse.json(statements);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
