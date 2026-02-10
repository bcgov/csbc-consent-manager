import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ documentId: string; versionId: string }> },
) {
  try {
    const { documentId, versionId } = await params;
    const payload = await getPayload({ config });

    const document = await payload.findByID({
      collection: "documents",
      id: documentId,
      depth: 0,
      overrideAccess: true,
    });

    const version = await payload.findByID({
      collection: "versions",
      id: versionId,
      depth: 0,
      overrideAccess: true,
    });

    const versionDocumentId =
      typeof version.document === "string"
        ? version.document
        : (version.document as { id: string }).id;

    if (versionDocumentId !== document.id) {
      return NextResponse.json(
        { error: "Version does not belong to this document." },
        { status: 404 },
      );
    }

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
      return NextResponse.json({ error: "Resource not found." }, { status: 404 });
    }
    const message = err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status });
  }
}
