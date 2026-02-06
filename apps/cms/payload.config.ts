import Users from "./src/collections/Users";
import { keycloakPlugin } from "./src/plugins/keycloak/keycloak.plugin";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";

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
  collections: [Users],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
  }),
  plugins: [keycloakPlugin],
  secret: process.env.PAYLOAD_SECRET || "",
  sharp,
});
