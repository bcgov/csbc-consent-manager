import { extractAndVerifyToken } from "@/lib/auth";
import config from "@payload-config";
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ statementId: string }> },
) {
  try {
    const auth = await extractAndVerifyToken(req);
    if (auth.error) return auth.error;

    const { statementId } = await params;
    const payload = await getPayload({ config });

    const subject = await payload.find({
      collection: "subjects",
      where: { id: { equals: auth.claims!.sub } },
      limit: 1,
      overrideAccess: true,
    });

    if (subject.docs.length === 0) {
      return NextResponse.json(
        { error: "Statement not found." },
        { status: 404 },
      );
    }

    const statements = await payload.find({
      collection: "statements",
      where: {
        id: { equals: statementId },
        subject: { equals: subject.docs[0].id },
      },
      limit: 1,
      overrideAccess: true,
    });

    if (statements.docs.length === 0) {
      return NextResponse.json(
        { error: "Statement not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(statements.docs[0]);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const OPTIONS = async (_req: NextRequest) => {
  return new NextResponse("", {
    status: 200,
  });
};
