#!/usr/bin/env bash
# Regenerate the self-signed localhost certificate.
# Run this once on first setup, or whenever the cert expires (valid 10 years).
#
# After running, trust the cert on macOS:
#   sudo security add-trusted-cert -d -r trustRoot \
#     -k /Library/Keychains/System.keychain certs/localhost.pem

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout "$SCRIPT_DIR/localhost-key.pem" \
  -out    "$SCRIPT_DIR/localhost.pem" \
  -days 3650 \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

echo ""
echo "Cert generated. To silence browser warnings, trust it on macOS:"
echo ""
echo "  sudo security add-trusted-cert -d -r trustRoot \\"
echo "    -k /Library/Keychains/System.keychain certs/localhost.pem"
echo ""
