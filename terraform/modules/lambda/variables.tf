# terraform/modules/lambda/variables.tf

variable "function_name" {
  type = string
}

variable "lambda_role_arn" {
  type = string
}

variable "filename" {
  type = string
}

variable "environment_variables" {
  type = map(string), default = {}
}