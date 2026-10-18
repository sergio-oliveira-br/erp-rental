# terraform/environments/production/variables.tf

variable "aws_region" {
  type = string, default = "sa-east-1"
}

variable "project_name" {
  type = string, default = "erp-rental-backend"
}

variable "environment_variables" {
  type = map(string), default = {}
}