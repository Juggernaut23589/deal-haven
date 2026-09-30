#!/usr/bin/env bash
# Ashimarket — single-VM server setup (Contabo)
#
# Replaces the old two-host Ansible setup (Oracle app-01 + db-01). This box runs
# nginx, Node/PM2, PostgreSQL, and Redis together, sized for 8GB RAM.
#
# Idempotent: safe to re-run. Each section skips work that's already done.
#
# Usage: run as the `deploy` user (needs passwordless sudo, already configured).
#   ssh contabo-ashimarket
#   sudo bash infra/scripts/setup-server.sh
#
# Prerequisites this script assumes are already done (see migration plan Phase 0/1):
#   - `deploy` user exists with SSH key access and passwordless sudo
#   - UFW active, allowing 22/80/443
#   - 2GB swap configured

set -euo pipefail

DEPLOY_USER="deploy"
APP_DIR="/home/${DEPLOY_USER}/ashimarket"
DOMAIN="ashimarket.com"
NODE_VERSION="20"
PG_VERSION="16"

if [[ $EUID -ne 0 ]]; then
  echo "Run this with sudo: sudo bash $0" >&2
  exit 1
fi

log() { echo -e "\n\033[1;32m==>\033[0m $1"; }

# ── Base packages ───────────────────────────────────────────────────────────
log "Installing base packages"
apt-get update -qq
apt-get install -y -qq \
  curl wget git unzip htop net-tools \
  software-properties-common apt-transport-https ca-certificates gnupg lsb-release \
  fail2ban unattended-upgrades

# fail2ban for sshd — bans repeat auth failures without changing how anyone logs in
log "Configuring fail2ban"
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
EOF
systemctl enable --now fail2ban
systemctl restart fail2ban

dpkg-reconfigure -f noninteractive unattended-upgrades >/dev/null 2>&1 || true

# ── Node.js + PM2 ────────────────────────────────────────────────────────────
if ! command -v node &>/dev/null || [[ "$(node -v)" != v${NODE_VERSION}.* ]]; then
  log "Installing Node.js ${NODE_VERSION}"
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /usr/share/keyrings/nodesource.gpg
  echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_VERSION}.x nodistro main" \
    > /etc/apt/sources.list.d/nodesource.list
  apt-get update -qq
  apt-get install -y -qq nodejs
else
  log "Node.js already installed ($(node -v))"
fi

if ! command -v pm2 &>/dev/null; then
  log "Installing PM2"
  npm install -g pm2
  # Running as root, `pm2 startup` installs and enables its own systemd unit directly
  # (no follow-up command needed — it only prints one for non-root invocations).
  pm2 startup systemd -u "${DEPLOY_USER}" --hp "/home/${DEPLOY_USER}"
else
  log "PM2 already installed ($(pm2 -v))"
fi

# ── App directory + persistent uploads ──────────────────────────────────────
log "Ensuring app directory structure"
mkdir -p "${APP_DIR}"
for d in images/listings images/avatars images/banners documents; do
  mkdir -p "${APP_DIR}/backend/uploads/${d}"
done
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${APP_DIR}"

if [[ ! -f "${APP_DIR}/.env" ]]; then
  echo "⚠️  ${APP_DIR}/.env does not exist yet."
  echo "    Copy it from the old server or infra/env.production.example and fill in secrets."
fi

# ── PostgreSQL ───────────────────────────────────────────────────────────────
if ! command -v psql &>/dev/null; then
  log "Installing PostgreSQL ${PG_VERSION}"
  curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/postgresql.gpg
  echo "deb [signed-by=/usr/share/keyrings/postgresql.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
    > /etc/apt/sources.list.d/pgdg.list
  apt-get update -qq
  apt-get install -y -qq "postgresql-${PG_VERSION}" "postgresql-client-${PG_VERSION}"
else
  log "PostgreSQL already installed"
fi

PG_CONF="/etc/postgresql/${PG_VERSION}/main/postgresql.conf"
PG_HBA="/etc/postgresql/${PG_VERSION}/main/pg_hba.conf"

log "Tuning PostgreSQL for 8GB RAM (single-VM, localhost only)"
set_pg() { sed -i "s/^#\?${1} *=.*/${1} = ${2}/" "${PG_CONF}"; grep -q "^${1} = ${2}" "${PG_CONF}" || echo "${1} = ${2}" >> "${PG_CONF}"; }
set_pg listen_addresses "'localhost'"
set_pg shared_buffers "'2GB'"
set_pg effective_cache_size "'5GB'"
set_pg work_mem "'16MB'"
set_pg maintenance_work_mem "'512MB'"
set_pg max_connections "100"

# Same host now — no VCN subnet, trust only loopback.
grep -q "^host.*127.0.0.1/32.*scram-sha-256" "${PG_HBA}" || \
  echo "host    all             all             127.0.0.1/32            scram-sha-256" >> "${PG_HBA}"

systemctl enable --now postgresql
systemctl restart postgresql

echo
echo "PostgreSQL is installed and tuned. Create the database/user/password manually"
echo "(not automated — password should never live in this script or git):"
echo
echo "  sudo -u postgres psql -c \"CREATE DATABASE ashimarket;\""
echo "  sudo -u postgres psql -c \"CREATE USER ashimarket_app WITH PASSWORD '<generate one>';\""
echo "  sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE ashimarket TO ashimarket_app;\""
echo

# ── Redis ────────────────────────────────────────────────────────────────────
if ! command -v redis-server &>/dev/null; then
  log "Installing Redis"
  apt-get install -y -qq redis-server
else
  log "Redis already installed"
fi

log "Tuning Redis for 8GB RAM (localhost only)"
sed -i "s/^bind .*/bind 127.0.0.1/" /etc/redis/redis.conf
sed -i "s/^#\?maxmemory .*/maxmemory 512mb/" /etc/redis/redis.conf
sed -i "s/^#\?maxmemory-policy.*/maxmemory-policy noeviction/" /etc/redis/redis.conf
sed -i "s/^protected-mode .*/protected-mode yes/" /etc/redis/redis.conf
systemctl enable --now redis-server
systemctl restart redis-server

# ── nginx + certbot ──────────────────────────────────────────────────────────
if ! command -v nginx &>/dev/null; then
  log "Installing nginx + certbot"
  apt-get install -y -qq nginx certbot python3-certbot-nginx
else
  log "nginx already installed"
fi

rm -f /etc/nginx/sites-enabled/default

log "Installing Ashimarket nginx config"
cp "$(dirname "$0")/../nginx/ashimarket.conf" /etc/nginx/sites-available/ashimarket.conf
ln -sf /etc/nginx/sites-available/ashimarket.conf /etc/nginx/sites-enabled/ashimarket.conf

if [[ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
  echo
  echo "⚠️  No TLS cert found for ${DOMAIN}."
  echo "    If migrating from the old server: rsync /etc/letsencrypt across, then re-run this script."
  echo "    Otherwise (DNS already cut over), obtain fresh certs with:"
  echo "      sudo certbot certonly --nginx --non-interactive --agree-tos --email <you> -d ${DOMAIN} -d www.${DOMAIN}"
else
  log "TLS cert already present for ${DOMAIN}"
fi

systemctl enable nginx
if nginx -t; then
  # `enable --now` is a no-op if nginx is already running (e.g. auto-started by
  # apt during install, possibly on a stale/default config) — force a reload
  # explicitly so a valid on-disk config is actually picked up every time.
  systemctl start nginx
  systemctl reload nginx
else
  echo "⚠️  nginx config test failed — not starting/reloading. Fix the config and re-run." >&2
fi

# certbot's Debian/Ubuntu package ships its own systemd timer — just confirm it's on.
systemctl enable --now certbot.timer 2>/dev/null || true

log "Server setup complete."
echo "Next: create the DB (see above), copy .env into ${APP_DIR}/.env, then deploy via GitHub Actions."
