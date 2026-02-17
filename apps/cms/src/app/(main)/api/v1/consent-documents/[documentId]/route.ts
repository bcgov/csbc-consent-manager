import config from "@payload-config";
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import { Version } from "../../../../../../../payload-types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  try {
    const { documentId } = await params;
    const payload = await getPayload({ config });

    const document = await payload.findByID({
      collection: "documents",
      id: documentId,
      depth: 0,
      overrideAccess: true,
    });

    if (!document.publishedVersion) {
      return NextResponse.json(
        { error: "No published version found for this document." },
        { status: 404 },
      );
    }

    const publishedVersionId =
      typeof document.publishedVersion === "string"
        ? document.publishedVersion
        : (document.publishedVersion as Version).id;

    const version = await payload.findByID({
      collection: "versions",
      id: publishedVersionId,
      depth: 0,
      overrideAccess: true,
    });

    const documentType =
      typeof document.documentType === "string"
        ? document.documentType
        : (document.documentType as { id: string }).id;

    return NextResponse.json({
      id: document.id,
      versionId: version.id,
      type: documentType,
      name: document.name,
      version: version.version,
      content: version.content,
      signOff: version.signOff,
      createdAt: version.createdAt,
      updatedAt: version.updatedAt,
    });
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500;
    if (status === 404) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 },
      );
    }
    const message =
      err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status });
  }
}

export const OPTIONS = async (request: NextRequest) => {
  return new NextResponse("", {
    status: 200,
  });
};
