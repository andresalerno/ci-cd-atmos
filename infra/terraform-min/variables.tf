variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nome base do projeto (stack mínima)"
  type        = string
  default     = "devops-study-min"
}

variable "s3_bucket_name" {
  description = "Nome do bucket S3 (deixe vazio para gerar automaticamente)"
  type        = string
  default     = ""
}

