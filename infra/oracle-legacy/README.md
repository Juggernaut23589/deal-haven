# Ashimarket — Infrastructure (Oracle Cloud)

Terraform configuration that provisions the always-free Ampere A1 VM on
Oracle Cloud Infrastructure (OCI) plus its networking (VCN, subnet, IGW,
route table, security list).

## What gets created

| Resource              | Details                                                       |
|-----------------------|---------------------------------------------------------------|
| VCN                   | `10.0.0.0/16`                                                 |
| Internet Gateway      | Attached to VCN                                               |
| Public subnet         | `10.0.1.0/24`, public IPs enabled                             |
| Security list         | Ingress: 22, 80, 443, ICMP. Egress: all                       |
| Compute instance      | `VM.Standard.A1.Flex`, 4 OCPU, 24 GB RAM, Ubuntu 22.04 ARM   |

All resources are within OCI's **always-free** allowance.

## Prerequisites

1. **Terraform** >= 1.5 — `brew install terraform`
2. **OCI API key** set up on your user:
   - Console → Profile (top right) → User Settings → API Keys → Add API Key
   - Download the private key to `~/.oci/oci_api_key.pem` (`chmod 600`)
   - Copy the **fingerprint** and **config file preview** (tenancy/user OCIDs, region)
3. **SSH keypair** — e.g. `~/.ssh/id_ed25519.pub` (will be installed on the VM)

## Usage

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars with your OCIDs, fingerprint, key path, region

terraform init
terraform plan
terraform apply
```

After apply, the public IP is printed:

```bash
terraform output instance_public_ip
ssh ubuntu@$(terraform output -raw instance_public_ip)
```

## Teardown

```bash
terraform destroy
```

## Notes

- `terraform.tfvars` and state files are gitignored — they contain secrets.
- For production, move state to a remote backend (OCI Object Storage or S3).
- Restrict `ssh_ingress_cidr` to your public IP rather than `0.0.0.0/0`.
- Oracle Ubuntu images ship with iptables that block non-SSH ports. After
  first SSH, you'll need to open 80/443 on the VM itself (documented in the
  next setup step).
