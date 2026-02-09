import { APIError, CollectionBeforeChangeHook } from "payload";

export const validateDocumentAndVersion: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== "create") return data;

  // Validate document exists
  const document = await req.payload.findByID({
    collection: "documents",
    id: data!.document,
  }).catch(() => null);

  if (!document) {
    throw new APIError("Document not found.", 404);
  }

  // Validate version exists and belongs to the document
  const version = await req.payload.findByID({
    collection: "versions",
    id: data!.version,
  }).catch(() => null);

  if (!version) {
    throw new APIError("Version not found.", 404);
  }

  if (version.document !== data!.document) {
    throw new APIError("Version does not belong to the specified document.", 400);
  }

  if (version.status !== "published") {
    throw new APIError("Version is not published.", 400);
  }

  return data;
};
