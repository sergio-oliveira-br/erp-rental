# terraform/environments/production/outputs.tf

output "api_url" {
  value       = module.api_gateway.api_endpoint
  description = "URL publica do API Gateway para o frontend consumir"
}

output "lambda_artifacts_bucket_name" {
  description = "Bucket S3 para publicação do código Lambda."
  value       = module.lambda_artifacts.bucket_name
}
