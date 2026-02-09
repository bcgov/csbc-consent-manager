import { Access, CollectionConfig } from "payload";
import { validateDocumentAndVersion } from "./hooks/beforeChange.hooks";
import { generateId } from "./hooks/beforeValidate.hooks";

const isAdminOrContributor: Access = async ({ req }) => {
  const user = req.user;
  if (!user) return false;

  if (user.role === "admin") return true;

  // Find documents where this user is a contributor
  const contributions = await req.payload.find({
    collection: "contributors",
    where: { user: { equals: user.id } },
    limit: 0,
    overrideAccess: true,
  });

  if (contributions.docs.length === 0) return false;

  const documentIds = contributions.docs.map((c) => c.document);

  return {
    document: { in: documentIds },
  };
};

const Statements: CollectionConfig = {
  slug: "statements",
  admin: {
    defaultColumns: ["subject", "document", "version", "status", "createdAt"],
  },
  access: {
    create: () => false,
    read: isAdminOrContributor,
    update: () => false,
    delete: () => false,
  },
  hooks: {
    beforeChange: [validateDocumentAndVersion],
  },
  labels: {
    singular: "Consent Statement",
    plural: "Consent Statements",
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
    },
    {
      name: "subject",
      label: "Subject",
      type: "relationship",
      relationTo: "subjects",
      required: true,
    },
    {
      name: "version",
      label: "Version",
      type: "relationship",
      relationTo: "versions",
      required: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { label: "Granted", value: "granted" },
        { label: "Denied", value: "denied" },
      ],
    },
  ],
};

export default Statements;
