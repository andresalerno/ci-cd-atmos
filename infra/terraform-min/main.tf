locals {
  tags = {
    Project = var.project_name
  }
}

resource "random_string" "bucket_suffix" {
  length  = 6
  upper   = false
  special = false
}

locals {
  s3_bucket_name = var.s3_bucket_name != "" ? var.s3_bucket_name : "${var.project_name}-${random_string.bucket_suffix.result}"
}

resource "aws_s3_bucket" "site" {
  bucket = local.s3_bucket_name
  tags   = local.tags
}

# Website estático (acadêmico: público)
resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.site.id
  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "index.html"
  }
}

# Desabilita bloqueio de público (acadêmico; não usar em produção)
resource "aws_s3_bucket_public_access_block" "site" {
  bucket                  = aws_s3_bucket.site.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Política para leitura pública do conteúdo
resource "time_sleep" "wait_public_access_block" {
  depends_on      = [aws_s3_bucket_public_access_block.site]
  create_duration = "10s"
}

resource "aws_s3_bucket_policy" "public_read" {
  bucket     = aws_s3_bucket.site.id
  depends_on = [time_sleep.wait_public_access_block]
  policy     = jsonencode({
    Version   = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = ["s3:GetObject"]
        Resource  = ["${aws_s3_bucket.site.arn}/*"]
      }
    ]
  })
}

output "s3_bucket_name" {
  value = aws_s3_bucket.site.bucket
}

output "s3_website_endpoint" {
  value = aws_s3_bucket_website_configuration.site.website_endpoint
}

output "region" {
  value = var.aws_region
}
