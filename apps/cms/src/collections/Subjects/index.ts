import { CollectionConfig } from "payload";

const Subjects: CollectionConfig = {
  slug: "subjects",
  admin: {
    hidden: true,
    useAsTitle: "fullName",
  },
  access: {
    create: () => false,
    read: ({ req }) => !!req.user,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: "id",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
    },
    {
      name: "fullName",
      label: "Full Name",
      type: "text",
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            delete siblingData.fullName;
          },
        ],
        afterRead: [
          ({ siblingData }) => {
            return `${siblingData.firstName ?? ""} ${siblingData.lastName ?? ""}`.trim();
          },
        ],
      },
    },
    {
      name: "firstName",
      label: "First Name",
      type: "text",
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text",
    },
  ],
};

export default Subjects;
