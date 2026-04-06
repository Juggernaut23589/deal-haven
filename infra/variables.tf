############################################
# OCI authentication
############################################
variable "tenancy_ocid" {
  description = "OCID of your OCI tenancy"
  type        = string
}

variable "user_ocid" {
  description = "OCID of the OCI user Terraform will authenticate as"
  type        = string
}

variable "fingerprint" {
  description = "Fingerprint of the API signing key uploaded to the OCI user"
  type        = string
}

variable "private_key_path" {
  description = "Local path to the API signing private key (PEM)"
  type        = string
}

variable "region" {
  description = "OCI region (e.g. eu-frankfurt-1, uk-london-1, us-ashburn-1)"
  type        = string
}

variable "compartment_ocid" {
  description = "OCID of the compartment to create resources in (root tenancy OCID is fine for a personal project)"
  type        = string
}

############################################
# Project / naming
############################################
variable "project_name" {
  description = "Short project identifier used as a prefix for resource names"
  type        = string
  default     = "deal-haven"
}

variable "environment" {
  description = "Environment label (dev, staging, prod)"
  type        = string
  default     = "staging"
}

############################################
# Networking
############################################
variable "vcn_cidr" {
  description = "CIDR block for the VCN"
  type        = string
  default     = "10.0.0.0/16"
}

variable "subnet_cidr" {
  description = "CIDR block for the public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "ssh_ingress_cidr" {
  description = "CIDR allowed to SSH into the VM. Set to your public IP/32 for safety."
  type        = string
  default     = "0.0.0.0/0"
}

############################################
# Compute
############################################
variable "instance_shape" {
  description = "OCI shape. VM.Standard.A1.Flex = always-free Ampere ARM."
  type        = string
  default     = "VM.Standard.E2.1.Micro"
}

variable "instance_ocpus" {
  description = "Number of OCPUs (Ampere free tier allows up to 4 total across instances)"
  type        = number
  default     = 4
}

variable "instance_memory_gb" {
  description = "Memory in GB (Ampere free tier allows up to 24 GB total across instances)"
  type        = number
  default     = 24
}

variable "boot_volume_size_gb" {
  description = "Boot volume size in GB (min 50)"
  type        = number
  default     = 100
}

variable "ssh_public_key_path" {
  description = "Local path to the SSH public key to install on the VM (e.g. ~/.ssh/id_ed25519.pub)"
  type        = string
}
