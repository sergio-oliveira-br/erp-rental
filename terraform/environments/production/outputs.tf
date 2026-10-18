# terraform/environments/production/outputs.tf

output "api_url" {
  value       = module.api_gateway.api_endpoint
  description = "URL publica do API Gateway para o frontend consumir"
}