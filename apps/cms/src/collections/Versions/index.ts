import { CollectionConfig } from "payload";
import { assignVersionNumber, deriveStatus } from "./hooks/beforeChange.hooks";
import { populateSearchContent } from "./hooks/populateSearchContent";

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
    useAsTitle: "version",
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
    beforeChange: [assignVersionNumber, deriveStatus, populateSearchContent],
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
      localized: true,
    },
    {
      name: "searchContent",
      type: "text",
      localized: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: "signOff",
      label: "Sign Off",
      type: "text",
      localized: true,
      defaultValue: ({ locale }) => {
        if (locale === "fr") {
          return "J'accepte les conditions énoncées ci-dessus.";
        }

        return "I accept the terms outlined above.";
      },
      admin: {
        description:
          "This text will be shown to end users next to the consent checkbox.",
        placeholder: "I accept the terms outlined above.",
      },
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
