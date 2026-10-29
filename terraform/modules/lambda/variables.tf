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
  type    = map(string)
  default = {}
}

variable "otel_enabled" {
  description = "Ativa a instrumentação automática OpenTelemetry"
  type        = bool
  default     = true
}

variable "otel_layer_arn" {
  description = "ARN da Layer ADOT compatível com Python 3.12"
  type        = string
  default     = "arn:aws:lambda:sa-east-1:615299751070:layer:AWSOpenTelemetryDistroPython:29"
}

variable "otel_service_name" {
  description = "Nome do serviço nos traces"
  type        = string
  default     = "erp-rental-backend"
}