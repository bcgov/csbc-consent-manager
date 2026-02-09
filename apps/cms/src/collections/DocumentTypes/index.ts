import { CollectionConfig, FieldAccess } from "payload";
import { slugifyName } from "./hooks/beforeValidate.hooks";

const denyUpdate: FieldAccess = () => false;

const DocumentTypes: CollectionConfig = {
  slug: "document-types",
  admin: {
    defaultColumns: ["id", "name", "enabled", "createdAt", "updatedAt"],
    useAsTitle: "name",
  },
  fields: [
    {
      name: "id",
      type: "text",
      unique: true,
      admin: {
        components: {
          Field: "./src/components/fields/SlugFromName.tsx#SlugFromName",
        },
      },
      hooks: {
        beforeValidate: [slugifyName],
      },
    },
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
      access: {
        update: denyUpdate,
      },
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
    },
    {
      name: "enabled",
      label: "Enabled",
      type: "checkbox",
      defaultValue: true,
    },
  ],
};

export default DocumentTypes;
