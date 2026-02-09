import { createRemoteJWKSet, jwtVerify } from "jose";

interface ExternalJWTPayload {
  sub: string;
  email: string;
  given_name: string;
  family_name: string;
}

const issuer = process.env.OIDC_ISSUER!;
const jwksUri = `${issuer}/protocol/openid-connect/certs`;
const JWKS = createRemoteJWKSet(new URL(jwksUri));

export async function verifyExternalJWT(
  token: string,
): Promise<ExternalJWTPayload> {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer,
  });

  return {
    sub: payload.sub as string,
    email: payload.email as string,
    given_name: payload.given_name as string,
    family_name: payload.family_name as string,
  };
}
