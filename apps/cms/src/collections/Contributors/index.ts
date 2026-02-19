import { CollectionConfig } from "payload";
import { preventDuplicateContributor } from "./hooks/beforeChange.hooks";

const Contributors: CollectionConfig = {
  slug: "contributors",
  admin: {
    defaultColumns: ["user", "role", "createdAt"],
    hidden: true,
  },
  hooks: {
    beforeChange: [preventDuplicateContributor],
  },
  indexes: [
    {
      fields: ["document", "user"],
      unique: true,
    },
  ],
  fields: [
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
      name: "user",
      label: "User",
      type: "relationship",
      relationTo: "users",
      required: true,
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      required: true,
      options: [
        { label: "Owner", value: "owner" },
        { label: "Editor", value: "editor" },
        { label: "Viewer", value: "viewer" },
      ],
    },
  ],
};

export default Contributors;
