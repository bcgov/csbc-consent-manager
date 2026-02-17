import { createRemoteJWKSet, jwtVerify } from "jose";

interface ExternalJWTPayload {
  sub: string;
  email: string;
  given_name: string;
  family_name: string;
}

let jwks: ReturnType<typeof createRemoteJWKSet>;

function getJWKS() {
  if (!jwks) {
    const issuer = process.env.OIDC_ISSUER;
    if (!issuer) throw new Error("OIDC_ISSUER is not set");
    jwks = createRemoteJWKSet(
      new URL(`${issuer}/protocol/openid-connect/certs`),
    );
  }
  return jwks;
}

export async function verifyExternalJWT(
  token: string,
): Promise<ExternalJWTPayload> {
  const issuer = process.env.OIDC_ISSUER;
  const { payload } = await jwtVerify(token, getJWKS(), {
    issuer,
  });

  return {
    sub: payload.sub as string,
    email: payload.email as string,
    given_name: payload.given_name as string,
    family_name: payload.family_name as string,
  };
}
