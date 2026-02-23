# Developer Guide

## Prerequisites

- Node.js >= 18
- npm 11.6.2
- Docker (for local Postgres)
- `oc` CLI v4 (for OpenShift deployments)
- Helm >= 3.13 (for chart deployments)

## Local Development

### 1. Start PostgreSQL

```bash
docker compose -f docker/postgres/compose.yaml up -d
```

This starts PostgreSQL 18 on port `5542` with default credentials (`postgres`/`postgres`).

### 2. Create a `.env` file

Copy the example below into `apps/cms/.env`:

```env
NEXT_PUBLIC_URL=http://localhost:3000
DATABASE_URI=postgres://postgres:postgres@127.0.0.1:5442/consent-manager
OIDC_ISSUER=https://dev.loginproxy.gov.bc.ca/auth/realms/standard
OIDC_CLIENT_ID=<your-client-id>
OIDC_CLIENT_SECRET=<your-client-secret>
PAYLOAD_SECRET=<any-random-string>
```

### 3. Install dependencies and run

```bash
npm install
npm run dev
```

The CMS will be available at `http://localhost:3000`.

### 4. Seed the database (optional)

To populate the database with initial document types, documents, and version content:

```bash
npm -w cms run seed
```

The seed script is idempotent — it skips seeding if data already exists in each collection.

---

## OpenShift Deployment

### Namespaces

| Environment | Namespace    |
|-------------|--------------|
| dev         | `d62e77-dev` |
| test        | `d62e77-test`|
| prod        | `d62e77-prod`|

### Creating OpenShift Secrets

Before deploying either Helm chart, you must create the required secrets in each namespace. Log in with `oc` as a namespace admin first.

#### PostgreSQL secret

```bash
oc create secret generic csbc-consent-manager-postgres-credentials \
  --from-literal=password=<postgres-password> \
  -n <namespace>
```

#### CMS secret

The `database-uri` must point to the PostgreSQL service deployed by the postgres chart. The format is:

```
postgres://<username>:<password>@csbc-consent-manager-postgres.<namespace>.svc:5432/csbc-consent-manager
```

```bash
oc create secret generic csbc-consent-manager-cms-credentials \
  --from-literal=database-uri='postgres://csbc-consent-manager:<postgres-password>@csbc-consent-manager-postgres:5432/csbc-consent-manager' \
  --from-literal=payload-secret=<random-string> \
  --from-literal=oidc-client-id=<keycloak-client-id> \
  --from-literal=oidc-client-secret=<keycloak-client-secret> \
  -n <namespace>
```

Repeat for each namespace (`d62e77-dev`, `d62e77-test`, `d62e77-prod`).

### Deploying the PostgreSQL Chart (Manual)

The PostgreSQL chart is deployed manually and is not part of the CI/CD pipeline.

```bash
helm upgrade --install csbc-consent-manager-postgres \
  infrastructure/helm/postgres \
  -f infrastructure/helm/postgres/values.dev.yaml \
  --labels app.kubernetes.io/part-of=csbc-consent-manager \
  -n <namespace>
```

### Deploying the CMS Chart (Automated)

The CMS chart is deployed automatically by GitHub Actions. See the CI/CD section below.

---

## CI/CD Pipeline

### How It Works

A single workflow (`.github/workflows/deploy.yaml`) handles all environments:

| Trigger                | Environment | Image Tag       |
|------------------------|-------------|-----------------|
| Push to `develop`      | dev         | `<short-sha>`   |
| Push to `main`         | test        | `<short-sha>`   |
| Push tag `v*`          | prod        | `<tag-name>`    |

The workflow builds two Docker images (`csbc-consent-manager-cms` and `csbc-consent-manager-cms-migrate`), pushes them to `ghcr.io`, and deploys the CMS Helm chart to the corresponding OpenShift namespace.

The workflow will fail early if the `OC_SERVER` variable is not configured for the target environment, preventing accidental deploys to unconfigured environments.

### GitHub Environments Setup

Create three GitHub environments under **Settings > Environments**: `dev`, `test`, and `prod`.

For each environment, add the following:

#### Variables

| Variable       | Description                              | Example                                                    |
|----------------|------------------------------------------|------------------------------------------------------------|
| `OC_SERVER`    | OpenShift API server URL                 | `https://api.silver.devops.gov.bc.ca:6443`                 |
| `OC_NAMESPACE` | Target namespace for this environment    | `d62e77-dev`                                               |
| `OIDC_ISSUER`  | Keycloak OIDC issuer URL                 | `https://dev.loginproxy.gov.bc.ca/auth/realms/standard`    |

#### Secrets

| Secret     | Description                              |
|------------|------------------------------------------|
| `OC_TOKEN` | OpenShift service account token          |

The `GITHUB_TOKEN` is used automatically for `ghcr.io` authentication — no extra secret needed.

### Generating the `OC_TOKEN` Secret

For each namespace, create a service account and generate a long-lived token:

```bash
NS=d62e77-dev  # repeat for d62e77-test, d62e77-prod

# Create service account
oc create sa github-actions -n $NS

# Grant edit permissions
oc policy add-role-to-user edit system:serviceaccount:$NS:github-actions -n $NS

# Generate a token (valid for 1 year)
oc create token github-actions -n $NS --duration=8760h
```

The `oc create token` command prints the token. Paste it as the `OC_TOKEN` secret in the matching GitHub environment.

### Keycloak Redirect URI

For OIDC login to work, the Keycloak client must have the callback URL in its allowed redirect URIs:

```
https://<route-host>/oauth/keycloak/callback
```

For example, for dev: `https://csbc-consent-manager-dev.apps.gold.devops.gov.bc.ca/oauth/keycloak/callback`

### Deploying to Production

To deploy to production, create and push a Git tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

This triggers a workflow run that builds images tagged `v1.0.0` and deploys them to the `prod` environment.

### Important Notes

- The workflow must exist on the branch/tag that triggers it. Changes to the workflow on `main` won't affect `develop` until merged.
- `NEXT_PUBLIC_URL` is automatically derived from `route.host` in the Helm values — no need to set it separately.
- If you change `nameOverride` or other values that affect deployment selectors, you must delete the existing deployment before redeploying (`oc delete deployment <name> -n <namespace>`).
- If you need to change `route.host` on an existing route, delete the route first as the field is immutable (`oc delete route <name> -n <namespace>`).
