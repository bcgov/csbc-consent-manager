import { CollectionBeforeChangeHook } from "payload";

export const assignVersionNumber: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== "create" || !data?.document) return data;

  const existing = await req.payload.find({
    collection: "versions",
    where: {
      document: { equals: data.document },
    },
    sort: "-version",
    limit: 1,
  });

  data.version = existing.totalDocs > 0 ? (existing.docs[0].version ?? 0) + 1 : 1;

  return data;
};

export const deriveStatus: CollectionBeforeChangeHook = async ({ data }) => {
  if (data?.archivedAt) {
    data.status = "archived";
  } else if (data?.publishedAt) {
    data.status = "published";
  } else {
    data.status = "draft";
  }

  return data;
};
