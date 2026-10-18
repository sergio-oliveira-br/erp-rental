# terraform/modules/lambda/main.tf

resource "aws_lambda_function" "api" {
  filename         = var.filename
  function_name    = var.function_name
  role             = var.lambda_role_arn
  handler          = "src.entrypoints.handlers.app.handler"
  runtime          = "python3.12"
  timeout          = 30
  memory_size      = 256

  environment {
    variables = var.environment_variables
  }

  lifecycle {
    ignore_changes = [
      filename,
      source_code_hash,
    ]
  }
}