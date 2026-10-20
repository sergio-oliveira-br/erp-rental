# terraform/environments/production/main.tf

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ZIP temporário para inicializar a Lambda
data "archive_file" "dummy" {
  type        = "zip"
  output_path = "${path.module}/dummy.zip"

  source {
    content  = "print('placeholder')"
    filename = "main.py"
  }
}

# IAM
module "iam" {
  source       = "../../modules/iam"
  project_name = var.project_name
}

# Bucket S3 para os artefatos de deploy
module "lambda_artifacts" {
  source = "../../modules/lambda_artifacts"

  bucket_name = var.lambda_artifacts_bucket_name

  tags = {
    Environment = "production"
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }
}

# Lambda
module "lambda" {
  source                = "../../modules/lambda"
  function_name         = var.project_name
  lambda_role_arn       = module.iam.lambda_role_arn
  filename              = data.archive_file.dummy.output_path
  environment_variables = var.environment_variables
}

# API Gateway
module "api_gateway" {
  source       = "../../modules/api_gateway"
  project_name = var.project_name
  lambda_arn   = module.lambda.lambda_arn
  lambda_name  = module.lambda.lambda_name
}
