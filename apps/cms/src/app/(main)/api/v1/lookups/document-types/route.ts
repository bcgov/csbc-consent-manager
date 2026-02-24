import config from "@payload-config";
import { NextRequest, NextResponse } from "next/server";
import { getPayload, Where } from "payload";

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config });

    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    const where: Where = { enabled: { equals: true } };
    if (name) {
      where.name = { like: name };
    }

    const result = await payload.find({
      collection: "document-types",
      where,
      sort: "name",
      overrideAccess: true,
    });

    const docs = result.docs.map(({ id, name, description }) => ({
      id,
      name,
      description,
    }));

    return NextResponse.json({ docs });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
