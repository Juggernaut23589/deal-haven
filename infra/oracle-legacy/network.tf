locals {
  name_prefix = "${var.project_name}-${var.environment}"
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# Virtual Cloud Network
resource "oci_core_vcn" "this" {
  compartment_id = var.compartment_ocid
  display_name   = "${local.name_prefix}-vcn"
  cidr_blocks    = [var.vcn_cidr]
  dns_label      = "ashimarket"
  freeform_tags  = local.common_tags
}

# Internet Gateway
resource "oci_core_internet_gateway" "this" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.this.id
  display_name   = "${local.name_prefix}-igw"
  enabled        = true
  freeform_tags  = local.common_tags
}

# Route Table: default route -> IGW
resource "oci_core_route_table" "public" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.this.id
  display_name   = "${local.name_prefix}-rt-public"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.this.id
  }

  freeform_tags = local.common_tags
}

# Security List: SSH + HTTP + HTTPS ingress
resource "oci_core_security_list" "public" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.this.id
  display_name   = "${local.name_prefix}-seclist-public"

  # All egress allowed
  egress_security_rules {
    destination      = "0.0.0.0/0"
    destination_type = "CIDR_BLOCK"
    protocol         = "all"
    stateless        = false
  }

  # SSH
  ingress_security_rules {
    source      = var.ssh_ingress_cidr
    source_type = "CIDR_BLOCK"
    protocol    = "6" # TCP
    stateless   = false
    tcp_options {
      min = 22
      max = 22
    }
  }

  # HTTP
  ingress_security_rules {
    source      = "0.0.0.0/0"
    source_type = "CIDR_BLOCK"
    protocol    = "6"
    stateless   = false
    tcp_options {
      min = 80
      max = 80
    }
  }

  # HTTPS
  ingress_security_rules {
    source      = "0.0.0.0/0"
    source_type = "CIDR_BLOCK"
    protocol    = "6"
    stateless   = false
    tcp_options {
      min = 443
      max = 443
    }
  }

  # PostgreSQL (VCN internal only)
  ingress_security_rules {
    source      = var.subnet_cidr
    source_type = "CIDR_BLOCK"
    protocol    = "6"
    stateless   = false
    tcp_options {
      min = 5432
      max = 5432
    }
  }

  # Redis (VCN internal only)
  ingress_security_rules {
    source      = var.subnet_cidr
    source_type = "CIDR_BLOCK"
    protocol    = "6"
    stateless   = false
    tcp_options {
      min = 6379
      max = 6379
    }
  }

  # ICMP (ping + path MTU)
  ingress_security_rules {
    source      = "0.0.0.0/0"
    source_type = "CIDR_BLOCK"
    protocol    = "1"
    stateless   = false
    icmp_options {
      type = 3
      code = 4
    }
  }

  freeform_tags = local.common_tags
}

# Public subnet
resource "oci_core_subnet" "public" {
  compartment_id             = var.compartment_ocid
  vcn_id                     = oci_core_vcn.this.id
  cidr_block                 = var.subnet_cidr
  display_name               = "${local.name_prefix}-subnet-public"
  dns_label                  = "public"
  prohibit_public_ip_on_vnic = false
  route_table_id             = oci_core_route_table.public.id
  security_list_ids          = [oci_core_security_list.public.id]
  freeform_tags              = local.common_tags
}
