import { PayloadRequest } from "payload";
import { OAuth2Plugin } from "payload-oauth2";

export const keycloakPlugin = OAuth2Plugin({
  failureRedirect: (req: PayloadRequest, error?: unknown) => {
    req.payload.logger.error(error);

    return "/admin/login";
  },
  getUserInfo: async (accessToken: String, req: PayloadRequest) => {
    const response = await fetch(
      `${process.env.OIDC_ISSUER}/protocol/openid-connect/userinfo`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    const user = await response.json();

    const { totalDocs } = await req.payload.count({ collection: "users" });
    const role = totalDocs === 0 ? "admin" : "user";

    return {
      id: user.sub,
      firstName: user.given_name,
      lastName: user.family_name,
      role,
    };
  },
  successRedirect: (req: PayloadRequest, accessToken?: string) => {
    return "/admin";
  },
  authCollection: "users",
  authorizePath: "/oauth/keycloak",
  callbackPath: "/oauth/keycloak/callback",
  clientId: process.env.OIDC_CLIENT_ID,
  clientSecret: process.env.OIDC_CLIENT_SECRET,
  enabled: true,
  onUserNotFoundBehavior: "create",
  providerAuthorizationUrl: `${process.env.OIDC_ISSUER}/protocol/openid-connect/auth`,
  scopes: ["openid", "email", "profile"],
  serverURL: process.env.NEXT_PUBLIC_URL,
  strategyName: "keycloak",
  subFieldName: "id",
  tokenEndpoint: `${process.env.OIDC_ISSUER}/protocol/openid-connect/token`,
  useEmailAsIdentity: false,
});
