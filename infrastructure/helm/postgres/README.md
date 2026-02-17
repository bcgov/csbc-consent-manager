# CSBC Consent Manager Postgres Helm Chart

Deploys a single node postgres database.  No HA, Backups, etc...

## Prerequisites

Create the OpenShift Secret containing the postgres password.

```sh
oc create \
    secret \
    generic \
    csbc-consent-manager-postgres-credentials \
    --from-literal=password=<password> \
    -n <namespace>
```

## Installation

```sh
helm <install|upgrade> csbc-consent-manager-postgres ./infrastructure/helm/postgres \
    -f ./infrastructure/helm/postgres/values.dev.yaml \
    -n <namespace>
```