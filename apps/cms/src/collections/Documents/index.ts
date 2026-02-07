import { randomUUID } from "crypto";
import { CollectionAfterChangeHook, CollectionConfig } from "payload";

const addOwnerContributor: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation === "create" && req.user) {
    await req.payload.create({
      collection: "contributors",
      data: {
        document: doc.id,
        user: req.user.id,
        role: "owner",
      },
      req,
    });
  }
  return doc;
};

const Documents: CollectionConfig = {
  slug: "documents",
  admin: {
    defaultColumns: ["name", "description", "createdAt", "updatedAt"],
    useAsTitle: "name",
  },
  hooks: {
    afterChange: [addOwnerContributor],
  },
  fields: [
    {
      name: "id",
      type: "text",
      admin: {
        hidden: true,
      },
      hooks: {
        beforeValidate: [({ value }) => value ?? randomUUID()],
      },
    },
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
    },
    {
      name: "organizationId",
      label: "Organization",
      type: "text",
      admin: {
        components: {
          Field:
            "./src/components/fields/OrganizationSelect.tsx#OrganizationSelect",
        },
      },
    },
    {
      name: "publishedVersion",
      label: "Published Version",
      type: "relationship",
      relationTo: "versions",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "versions",
      label: "Versions",
      type: "join",
      hasMany: true,
      collection: "versions",
      on: "document",
      admin: {
        allowCreate: true,
        condition: (data) => Boolean(data?.id),
      },
    },
    {
      name: "contributors",
      label: "Contributors",
      type: "join",
      hasMany: true,
      collection: "contributors",
      on: "document",
      admin: {
        allowCreate: true,
        condition: (data) => Boolean(data?.id),
      },
    },
  ],
};

export default Documents;
