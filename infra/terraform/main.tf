# Esqueleto inicial — módulos e recursos serão adicionados nos próximos passos

locals {
  tags = {
    Project = var.project_name
  }
}

output "region" {
  value = var.aws_region
}

