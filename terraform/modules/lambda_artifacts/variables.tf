
variable "bucket_name" {
  description = "Nome globalmente único do bucket de artefatos."
  type        = string
}

variable "tags" {
  description = "Tags aplicadas ao bucket."
  type        = map(string)
  default     = {}
}
