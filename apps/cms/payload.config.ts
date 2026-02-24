import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";
import Contributors from "./src/collections/Contributors";
import Documents from "./src/collections/Documents";
import DocumentTypes from "./src/collections/DocumentTypes";
import Statements from "./src/collections/Statements";
import Subjects from "./src/collections/Subjects";
import Users from "./src/collections/Users";
import Versions from "./src/collections/Versions";
import { keycloakPlugin } from "./src/plugins/keycloak/keycloak.plugin";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  editor: lexicalEditor(),
  admin: {
    components: {
      afterLogin: [
        "./src/plugins/keycloak/components/keycloak-login-button.component.tsx#KeycloakLoginButton",
      ],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
  },
  collections: [
    Contributors,
    Documents,
    DocumentTypes,
    Versions,
    Statements,
    Subjects,
    Users,
  ],
  db: postgresAdapter({
    allowIDOnCreate: true,
    idType: "uuid",
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
  }),
  localization: {
    locales: [
      { label: "English", code: "en" },
      { label: "French", code: "fr" },
    ],
    defaultLocale: "en",
    fallback: true,
  },
  plugins: [keycloakPlugin],
  secret: process.env.PAYLOAD_SECRET || "",
  sharp,
});
