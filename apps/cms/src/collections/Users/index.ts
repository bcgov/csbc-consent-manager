import { Access, CollectionConfig, FieldAccess } from "payload";
import { assignAdminToFirstUser } from "./hooks/beforeChange.hooks";

const isAdmin: Access = ({ req: { user } }) => user?.role === "admin";

const isAdminFieldLevel: FieldAccess = ({ req: { user } }) =>
  user?.role === "admin";

const Users: CollectionConfig = {
  slug: "users",
  admin: {
    defaultColumns: ["fullName", "role", "createdAt", "updatedAt"],
    useAsTitle: "fullName",
  },
  auth: {
    disableLocalStrategy: true,
  },
  hooks: {
    beforeChange: [assignAdminToFirstUser],
  },
  fields: [
    {
      name: "id",
      admin: {
        hidden: true,
        readOnly: true,
      },
      required: true,
      saveToJWT: true,
      type: "text",
      unique: true,
    },
    {
      name: "role",
      access: {
        update: isAdminFieldLevel,
      },
      defaultValue: "user",
      options: [
        {
          label: "Admin",
          value: "admin",
        },
        {
          label: "User",
          value: "user",
        },
      ],
      required: true,
      saveToJWT: true,
      type: "select",
    },
    {
      name: "fullName",
      label: "Full Name",
      type: "text",
      admin: {
        readOnly: true,
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

export default Users;
