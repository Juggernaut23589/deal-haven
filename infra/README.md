# Ashimarket — Infrastructure (Contabo)

Single VM running nginx, Node.js/PM2, PostgreSQL, and Redis together.
Provisioned with a plain idempotent shell script — no Ansible, no Terraform
for this host (Contabo VMs are created through their web panel, not an API
with a mature Terraform provider).

The old two-host Oracle Cloud setup (Terraform + Ansible) is preserved in
[`oracle-legacy/`](./oracle-legacy) until that infrastructure is formally
decommissioned — see `oracle-legacy/DECOMMISSION.md`.

## Layout

```
infra/
├── scripts/
│   └── setup-server.sh   # idempotent: installs & tunes nginx, Node/PM2, Postgres, Redis
├── nginx/
│   └── ashimarket.conf   # the live nginx site config
└── oracle-legacy/        # kept until Oracle VMs are torn down — see DECOMMISSION.md
```

## Server

| | |
|---|---|
| Host | `167.86.88.208` |
| OS | Ubuntu 24.04 LTS |
| Specs | 4 vCPU / 8 GB RAM / ~190 GB disk |
| Access | `ssh contabo-ashimarket` (key-based, `deploy` user, passwordless sudo) — see `~/.ssh/config` |
| Firewall | UFW: 22, 80, 443 only. Postgres/Redis bind to `127.0.0.1` and are never exposed. |

## First-time setup

```bash
ssh contabo-ashimarket
sudo bash infra/scripts/setup-server.sh
```

Idempotent — safe to re-run any time (e.g. after editing `nginx/ashimarket.conf`,
just re-run to pick it up and reload nginx).

What it does **not** do, on purpose:
- Create the `deploy` user or configure SSH/UFW — that's a one-time manual
  step per the migration plan (Phase 0/1), not something to automate blindly
  against a box you're already logged into.
- Create the database/user/password, or write `backend/.env` — secrets never
  belong in a script that's checked into git. The script prints the exact
  `psql` commands to run by hand.
- Obtain the TLS certificate if one doesn't already exist — prints the
  `certbot` command to run once DNS points at this box.

## Deploys

Handled by `.github/workflows/deploy.yml` on every push to `dev`: builds
both apps in CI, ships the artifacts, runs Prisma migrations, and restarts
both PM2 processes via [`../ecosystem.config.js`](../ecosystem.config.js).

## Day-to-day

```bash
ssh contabo-ashimarket
pm2 list                        # process status
pm2 logs ashimarket-api         # backend logs
pm2 logs ashimarket-web         # frontend logs
sudo nginx -t && sudo systemctl reload nginx   # after editing nginx config
```
