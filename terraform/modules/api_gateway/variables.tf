# terraform/modules/api_gateway/variables.tf

variable "project_name" {
  type = string
}

variable "lambda_arn" {
  type = string
}

variable "lambda_name" {
  type = string
}