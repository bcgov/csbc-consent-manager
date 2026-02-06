declare namespace NodeJS {
  interface ProcessEnv {
    // Client
    NEXT_PUBLIC_URL: string;
    // Server
    DATABASE_URI: string;
    OIDC_ISSUER: string;
    OIDC_CLIENT_ID: string;
    OIDC_CLIENT_SECRET: string;
    PAYLOAD_SECRET: string;
  }
}
