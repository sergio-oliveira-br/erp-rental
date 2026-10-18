# terraform/modules/lambda/outputs.tf

output "lambda_arn" {
  value = aws_lambda_function.api.arn
}

output "lambda_name" {
  value = aws_lambda_function.api.function_name
}