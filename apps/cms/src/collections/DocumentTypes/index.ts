import { CollectionConfig } from "payload";

const DocumentTypes: CollectionConfig = {
  slug: "document-types",
  admin: {
    defaultColumns: ["name", "enabled", "createdAt", "updatedAt"],
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      localized: true,
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
