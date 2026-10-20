# terraform/modules/lambda_artifacts/outputs.tf

output "bucket_name" {
  value = aws_s3_bucket.lambda_artifacts.id
}

output "bucket_arn" {
  value = aws_s3_bucket.lambda_artifacts.arn
}
