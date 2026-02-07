import { CollectionConfig } from "payload";
import { assignVersionNumber, deriveStatus } from "./hooks/beforeChange.hooks";
import { generateId } from "./hooks/beforeValidate.hooks";

const Versions: CollectionConfig = {
  slug: "versions",
  admin: {
    defaultColumns: [
      "document",
      "version",
      "status",
      "publishedAt",
      "archivedAt",
      "createdAt",
      "updatedAt",
    ],
    // hidden: true,
  },
  hooks: {
    beforeChange: [assignVersionNumber, deriveStatus],
  },
  fields: [
    {
      name: "id",
      type: "text",
      admin: {
        hidden: true,
      },
      hooks: {
        beforeValidate: [generateId],
      },
    },
    {
      name: "document",
      label: "Document",
      type: "relationship",
      relationTo: "documents",
      required: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
        { label: "Archived", value: "archived" },
      ],
      defaultValue: "draft",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "version",
      label: "Version",
      type: "number",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "content",
      label: "Content",
      type: "richText",
    },
    {
      name: "publishedAt",
      label: "Published At",
      type: "date",
      admin: {
        hidden: true,
      },
    },
    {
      name: "archivedAt",
      label: "Archived At",
      type: "date",
      admin: {
        hidden: true,
      },
    },
  ],
};

export default Versions;
