# Oracle → Contabo migration — decommission notes

This directory holds the Terraform that provisioned the old two-VM Oracle
Cloud setup (`app-01` 152.67.143.188, `db-01` 141.147.85.64). The project has
migrated to a single Contabo VM (167.86.88.208) with plain shell provisioning
— see `../scripts/setup-server.sh` and `../README.md`.

**Do not delete this directory until the Oracle VMs are actually terminated.**
`terraform destroy` needs `terraform.tfstate` (gitignored, present locally)
to know what to tear down.

## Decommission checklist

1. Confirm DNS has been on the Contabo IP for **at least 7 days** with no issues.
2. Confirm nothing still depends on the Oracle boxes (check nginx/app logs on
   both for recent real traffic, not just health checks).
3. Take one final backup from both Oracle VMs (DB dump, uploads, certs) even
   though the Contabo box should already have everything.
4. `cd infra/oracle-legacy && terraform destroy`
5. Once destroyed, this whole directory (including this file) can be deleted.
