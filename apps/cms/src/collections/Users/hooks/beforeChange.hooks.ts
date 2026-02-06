import { CollectionBeforeChangeHook } from "payload";

export const assignAdminToFirstUser: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation === "create") {
    const { totalDocs } = await req.payload.count({
      collection: "users",
    });
    if (totalDocs === 0) {
      data.role = "admin";
    }
  }
  return data;
};
