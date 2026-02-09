import { FieldHook } from "payload";

export const slugifyName: FieldHook = ({ siblingData }) => {
  const name = siblingData?.name;
  if (!name) return undefined;
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};
