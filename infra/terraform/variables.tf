variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nome base do projeto"
  type        = string
  default     = "devops-study"
}

# S3
variable "s3_bucket_name" {
  description = "Nome do bucket S3 (deixe vazio para gerar automaticamente)"
  type        = string
  default     = ""
}
variable "s3_versioning" {
  description = "Habilitar versionamento no bucket S3"
  type        = bool
  default     = true
}

# ECS / Service
variable "ecs_cluster_name" {
  description = "Nome do cluster ECS"
  type        = string
  default     = ""
}
variable "container_name" {
  description = "Nome do container na task definition"
  type        = string
  default     = "app"
}
variable "container_image" {
  description = "Imagem do container (ex: <account>.dkr.ecr.<region>.amazonaws.com/repo:tag)"
  type        = string
  default     = "nginx:stable"
}
variable "container_port" {
  description = "Porta exposta pelo container"
  type        = number
  default     = 3000
}
variable "desired_count" {
  description = "Número de tasks no serviço ECS"
  type        = number
  default     = 1
}
variable "fargate_cpu" {
  description = "CPU da task Fargate (ex: 256, 512)"
  type        = number
  default     = 256
}
variable "fargate_memory" {
  description = "Memória da task Fargate (ex: 512, 1024)"
  type        = number
  default     = 512
}
