import { CollectionConfig } from "payload";
import { assignVersionNumber, deriveStatus } from "./hooks/beforeChange.hooks";
import { generateId } from "./hooks/beforeValidate.hooks";

const Versions: CollectionConfig = {
  slug: "versions",
  disableDuplicate: true,
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
    hidden: true,
    components: {
      edit: {
        beforeDocumentControls: [
          "./src/components/VersionBadge.tsx#VersionBadge",
          "./src/components/StatusBadge.tsx#StatusBadge",
          "./src/components/ArchiveButton.tsx#ArchiveButton",
          "./src/components/PublishButton.tsx#PublishButton",
          "./src/components/EditVersionButton.tsx#EditVersionButton",
        ],
        editMenuItems: [
          "./src/components/CreateNewVersionMenuItem.tsx#CreateNewVersionMenuItem",
        ],
      },
    },
  },
  hooks: {
    beforeChange: [assignVersionNumber, deriveStatus],
  },
  labels: {
    singular: "Document Version",
    plural: "Document Versions",
  },
  fields: [
    {
      name: "formLock",
      type: "ui",
      admin: {
        components: {
          Field: "./src/components/FormLock.tsx#FormLock",
        },
      },
    },
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
        hidden: true,
      },
    },
    {
      name: "version",
      label: "Version",
      type: "number",
      admin: {
        hidden: true,
      },
    },
    {
      name: "content",
      label: "Content",
      type: "richText",
    },
    {
      name: "signOff",
      label: "Sign Off",
      type: "group",
      admin: {
        description:
          "This text will be shown to end users next to the I accept, I decline options.",
      },
      fields: [
        {
          name: "accept",
          label: "Accept",
          type: "text",
          defaultValue: "I accept the terms outlined above.",
          admin: {
            placeholder: "I accept the terms outlined above.",
          },
        },
        {
          name: "decline",
          label: "Decline",
          type: "text",
          defaultValue: "I decline the terms outlined above.",
          admin: {
            placeholder: "I decline the terms outlined above.",
          },
        },
      ],
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
