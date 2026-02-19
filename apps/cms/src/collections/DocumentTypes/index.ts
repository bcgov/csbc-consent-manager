import { CollectionConfig, FieldAccess } from "payload";

const denyUpdate: FieldAccess = () => false;

const DocumentTypes: CollectionConfig = {
  slug: "document-types",
  admin: {
    defaultColumns: ["id", "name", "enabled", "createdAt", "updatedAt"],
    useAsTitle: "name",
  },
  fields: [
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
