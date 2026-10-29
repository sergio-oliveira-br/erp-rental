# terraform/modules/lambda/main.tf

locals {
  otel_environment_variables = var.otel_enabled ? {
    AWS_LAMBDA_EXEC_WRAPPER = "/opt/otel-instrument"
    OTEL_SERVICE_NAME       = var.otel_service_name
  } : {}

  effective_environment_variables = merge(
    var.environment_variables,
    local.otel_environment_variables
  )

  effective_layers = var.otel_enabled ? [
    var.otel_layer_arn
  ] : []
}

resource "aws_lambda_function" "api" {
  filename      = var.filename
  function_name = var.function_name
  role          = var.lambda_role_arn
  handler       = "src.entrypoints.handlers.app.handler"
  runtime       = "python3.12"
  timeout       = 30
  memory_size   = 512

  layers = local.effective_layers

  environment {
    variables = local.effective_environment_variables
  }

  tracing_config {
    mode = var.otel_enabled ? "Active" : "PassThrough"
  }

  lifecycle {
    ignore_changes = [
      filename,
      source_code_hash,
    ]
  }
}