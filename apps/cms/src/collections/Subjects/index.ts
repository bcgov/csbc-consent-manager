import { CollectionConfig } from "payload";

const Subjects: CollectionConfig = {
  slug: "subjects",
  admin: {
    hidden: true,
  },
  access: {
    create: () => false,
    read: () => false,
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
