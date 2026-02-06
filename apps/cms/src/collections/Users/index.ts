import { Access, CollectionConfig, FieldAccess } from "payload";
import { assignAdminToFirstUser } from "./hooks/beforeChange.hooks";

const isAdmin: Access = ({ req: { user } }) => user?.role === "admin";

const isAdminFieldLevel: FieldAccess = ({ req: { user } }) => user?.role === "admin";

const Users: CollectionConfig = {
  slug: "users",
  admin: {},
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
      name: "first_name",
      label: "First Name",
      type: "text",
    },
    {
      name: "last_name",
      label: "Last Name",
      type: "text",
    },
  ],
};

export default Users;
