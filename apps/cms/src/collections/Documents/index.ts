import { randomUUID } from "crypto";
import {
  APIError,
  CollectionAfterChangeHook,
  CollectionBeforeDeleteHook,
  CollectionConfig,
} from "payload";

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

const createInitialVersion: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation === "create") {
    await req.payload.create({
      collection: "versions",
      data: {
        document: doc.id,
      },
      req,
    });
  }
  return doc;
};

const deleteRelatedDocs: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const statements = await req.payload.find({
    collection: "statements",
    where: { document: { equals: id } },
    limit: 1,
    req,
  });

  if (statements.totalDocs > 0) {
    throw new APIError(
      "Cannot delete a document that has consent statements. Remove all statements first.",
      400,
    );
  }

  const [contributors, versions] = await Promise.all([
    req.payload.find({ collection: "contributors", where: { document: { equals: id } }, limit: 0, req }),
    req.payload.find({ collection: "versions", where: { document: { equals: id } }, limit: 0, req }),
  ]);

  await Promise.all([
    ...contributors.docs.map((doc) =>
      req.payload.delete({ collection: "contributors", id: doc.id, req }),
    ),
    ...versions.docs.map((doc) =>
      req.payload.delete({ collection: "versions", id: doc.id, req }),
    ),
  ]);
};

const Documents: CollectionConfig = {
  slug: "documents",
  admin: {
    defaultColumns: ["name", "description", "createdAt", "updatedAt"],
    useAsTitle: "name",
  },
  hooks: {
    afterChange: [addOwnerContributor, createInitialVersion],
    beforeDelete: [deleteRelatedDocs],
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
      name: "organizationId",
      label: "Organization",
      type: "text",
      required: true,
      admin: {
        components: {
          Field:
            "./src/components/fields/OrganizationSelect.tsx#OrganizationSelect",
        },
      },
    },
    {
      name: "documentType",
      label: "Document Type",
      type: "relationship",
      relationTo: "document-types",
      required: true,
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
      name: "publishedVersion",
      label: "Published Version",
      type: "relationship",
      relationTo: "versions",
      admin: {
        readOnly: true,
        condition: (data) => Boolean(data?.id),
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
