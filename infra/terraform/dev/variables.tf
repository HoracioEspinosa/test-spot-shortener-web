variable "aws_region" {
  type        = string
  description = "AWS region"
}

variable "project_name" {
  type        = string
  description = "Project name/prefix for resources"
  default     = "spot2-frontend-dev"
}

variable "cluster_name" {
  type        = string
  description = "ECS Cluster name (not ARN), e.g. spot2-dev"
}

variable "image_url" {
  type        = string
  description = "Docker image URL, e.g. <account>.dkr.ecr.<region>.amazonaws.com/<repo>:<tag>"
}

variable "container_port" {
  type        = number
  description = "Container port exposed"
  default     = 80
}

variable "desired_count" {
  type        = number
  description = "Number of desired tasks"
  default     = 1
}

variable "backend_url" {
  type        = string
  description = "HTTP base URL of backend, e.g. http://<public-ip>:8000"
}

variable "healthcheck_path" {
  type        = string
  description = "ALB healthcheck path"
  default     = "/"
}
