import { APIError, CollectionBeforeChangeHook } from "payload";

export const preventDuplicateContributor: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== "create" || !data?.document || !data?.user) return data;

  const existing = await req.payload.find({
    collection: "contributors",
    where: {
      document: { equals: data.document },
      user: { equals: data.user },
    },
    limit: 1,
  });

  if (existing.totalDocs > 0) {
    throw new APIError(
      "This user is already a contributor on this document.",
      400,
    );
  }

  return data;
};
