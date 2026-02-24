import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { readFileSync } from "fs";
import path, { resolve } from "path";
import { buildConfig, getPayload } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";
import Contributors from "../../collections/Contributors";
import Documents from "../../collections/Documents";
import DocumentTypes from "../../collections/DocumentTypes";
import Statements from "../../collections/Statements";
import Subjects from "../../collections/Subjects";
import Users from "../../collections/Users";
import Versions from "../../collections/Versions";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const configPromise = buildConfig({
  editor: lexicalEditor(),
  admin: {
    importMap: {
      baseDir: path.resolve(dirname, "../../.."),
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
    idType: "uuid",
    allowIDOnCreate: true,
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
  secret: process.env.PAYLOAD_SECRET || "",
  sharp,
});

const versionFixtures = JSON.parse(
  readFileSync(
    resolve(process.cwd(), "src/scripts/seed/seed.data.json"),
    "utf-8",
  ),
) as VersionFixture[];

interface VersionFixture {
  id: string;
  documentName: string;
  version: number;
  status: string;
  publishedAt: string | null;
  archivedAt: string | null;
  content: { en: object; fr: object };
  signOff: { en: string; fr: string };
}

const documentTypes = [
  {
    id: "c690fb2f-11a4-4881-a8d7-e28ed593834e",
    name: { en: "Privacy Policy", fr: "Politique de confidentialité" },
    description: { en: "", fr: "" },
    enabled: true,
  },
  {
    id: "b0455974-94a3-4186-98cf-677dfdc17bea",
    name: { en: "Terms of Service", fr: "Conditions d\u2019utilisation" },
    description: { en: "", fr: "" },
    enabled: true,
  },
];

const documents = [
  {
    id: "8a3d30ad-37c0-439c-8690-87bcb38e77aa",
    organizationId: "69e7c7f4-ec8c-4523-991e-5471dd0e56ab",
    documentType: "Terms of Service",
    name: {
      en: "Acknowledgement of B.C. Government\u2019s responsibilities",
      fr: "Reconnaissance des responsabilit\u00e9s du gouvernement de la C.-B.",
    },
  },
  {
    id: "7aaef63c-7712-4033-b8a3-73370ed43587",
    organizationId: "69e7c7f4-ec8c-4523-991e-5471dd0e56ab",
    documentType: "Terms of Service",
    name: {
      en: "Acknowledgement of your rights and responsibilities",
      fr: "Reconnaissance de vos droits et responsabilit\u00e9s",
    },
  },
  {
    id: "2a686e18-fabd-41d3-9634-ea51d104242e",
    organizationId: "69e7c7f4-ec8c-4523-991e-5471dd0e56ab",
    documentType: "Terms of Service",
    name: {
      en: "Medical Services Plan (MSP) Client Release",
      fr: "Autorisation du client du r\u00e9gime d\u2019assurance-maladie (Medical Services Plan \u2013 MSP)",
    },
  },
  {
    id: "ad727499-6b04-4598-9ab2-715139ba76f0",
    organizationId: "69e7c7f4-ec8c-4523-991e-5471dd0e56ab",
    documentType: "Terms of Service",
    name: {
      en: "Consent to Disclose Information to Concerned Parties",
      fr: "Consentement \u00e0 la divulgation de renseignements \u00e0 des parties concern\u00e9es",
    },
  },
  {
    id: "d53f8b61-104a-4bac-9e68-7645695fa5f1",
    organizationId: "69e7c7f4-ec8c-4523-991e-5471dd0e56ab",
    documentType: "Terms of Service",
    name: {
      en: "Consent to Disclose Information to the Canada Revenue Agency (CRA)",
      fr: "Consentement \u00e0 la divulgation de renseignements \u00e0 l\u2019Agence du revenu du Canada (ARC)",
    },
  },
  {
    id: "d5cdf02e-9b6c-4c5c-bfe4-8337bda7bec7",
    organizationId: "69e7c7f4-ec8c-4523-991e-5471dd0e56ab",
    documentType: "Terms of Service",
    name: {
      en: "(Optional) Consent to receive proactive service recommendations",
      fr: "(Facultatif) Consentement \u00e0 recevoir des recommandations de services proactives",
    },
  },
];

async function seed() {
  const payload = await getPayload({ config: configPromise });

  payload.logger.info("Seeding database...");

  // --- Document Types ---

  const { totalDocs: existingDocTypes } = await payload.count({
    collection: "document-types",
  });

  if (existingDocTypes > 0) {
    payload.logger.info(
      `Skipping document types — ${existingDocTypes} already exist.`,
    );
  } else {
    for (const dt of documentTypes) {
      await payload.create({
        collection: "document-types",
        data: {
          id: dt.id,
          name: dt.name.en,
          description: dt.description.en,
          enabled: dt.enabled,
        },
        locale: "en",
      });

      await payload.update({
        collection: "document-types",
        id: dt.id,
        data: {
          name: dt.name.fr,
          description: dt.description.fr,
        },
        locale: "fr",
      });

      payload.logger.info(`Created document type: ${dt.name.en}`);
    }
  }

  // --- Documents ---

  const { totalDocs: existingDocs } = await payload.count({
    collection: "documents",
  });

  if (existingDocs > 0) {
    payload.logger.info(`Skipping documents — ${existingDocs} already exist.`);
  } else {
    // Build a lookup of document type name (en) -> id
    const docTypeMap = new Map(documentTypes.map((dt) => [dt.name.en, dt.id]));

    // Build a lookup of version fixtures by document name
    const versionsByDocName = new Map<string, VersionFixture[]>();
    for (const v of versionFixtures) {
      const existing = versionsByDocName.get(v.documentName) ?? [];
      existing.push(v);
      versionsByDocName.set(v.documentName, existing);
    }

    for (const doc of documents) {
      const documentTypeId = docTypeMap.get(doc.documentType);
      if (!documentTypeId) {
        payload.logger.error(
          `Document type "${doc.documentType}" not found — skipping "${doc.name.en}"`,
        );
        continue;
      }

      // Creating a document triggers the createInitialVersion hook,
      // which auto-creates a blank v1 draft.
      await payload.create({
        collection: "documents",
        data: {
          id: doc.id,
          organizationId: doc.organizationId,
          documentType: documentTypeId,
          name: doc.name.en,
        },
        locale: "en",
      });

      await payload.update({
        collection: "documents",
        id: doc.id,
        data: {
          name: doc.name.fr,
        },
        locale: "fr",
      });

      payload.logger.info(`Created document: ${doc.name.en}`);

      // --- Versions for this document ---

      const fixtures = versionsByDocName.get(doc.name.en) ?? [];
      if (fixtures.length === 0) {
        payload.logger.info(`  No version fixtures for "${doc.name.en}"`);
        continue;
      }

      // Delete the auto-created v1 so we can recreate it with an explicit ID
      const autoCreated = await payload.find({
        collection: "versions",
        where: { document: { equals: doc.id } },
        limit: 1,
        locale: "en",
      });

      if (autoCreated.docs[0]) {
        await payload.delete({
          collection: "versions",
          id: autoCreated.docs[0].id,
        });
      }

      for (const fixture of fixtures) {
        await payload.create({
          collection: "versions",
          data: {
            id: fixture.id,
            document: doc.id,
            content: fixture.content.en,
            signOff: fixture.signOff.en,
            publishedAt: fixture.publishedAt ?? undefined,
            archivedAt: fixture.archivedAt ?? undefined,
          },
          locale: "en",
        });

        await payload.update({
          collection: "versions",
          id: fixture.id,
          data: {
            content: fixture.content.fr,
            signOff: fixture.signOff.fr,
          },
          locale: "fr",
        });

        payload.logger.info(
          `  Created version ${fixture.version} (${fixture.id})`,
        );

        if (fixture.status === "published") {
          await payload.update({
            collection: "documents",
            id: doc.id,
            data: {
              publishedVersion: fixture.id,
            },
          });
          payload.logger.info(
            `  Set published version on document to v${fixture.version}`,
          );
        }
      }
    }
  }

  payload.logger.info("Seeding complete.");
  process.exit(0);
}

await seed();
