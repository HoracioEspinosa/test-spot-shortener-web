terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  name        = var.project_name
  container   = replace(var.project_name, "-", "_")
}

# Discover resources automatically
# Cluster from name
data "aws_ecs_cluster" "this" {
  cluster_name = var.cluster_name
}

# Use default VPC and its public subnets
# If you prefer a tagged VPC/subnets, this can be updated to data lookups by tags
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }

  # Filter subnets that assign public IP on launch (heuristic)
  # Alternatively, filter by tags or explicit list if needed
}

resource "aws_cloudwatch_log_group" "this" {
  name              = "/ecs/${local.name}"
  retention_in_days = 14
}

resource "aws_security_group" "svc" {
  name        = "${local.name}-sg"
  description = "Allow HTTP"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Task execution role
resource "aws_iam_role" "task_execution" {
  name               = "${local.name}-exec"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume_role.json
}

data "aws_iam_policy_document" "ecs_tasks_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "exec_policy" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Task definition with Nginx reverse proxy to backend
resource "aws_ecs_task_definition" "this" {
  family                   = local.name
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  network_mode             = "awsvpc"
  execution_role_arn       = aws_iam_role.task_execution.arn

  container_definitions = jsonencode([
    {
      name      = local.container
      image     = var.image_url
      essential = true
      portMappings = [{ containerPort = var.container_port, hostPort = var.container_port }]
      environment = [
        { name = "VITE_API_URL", value = var.backend_url }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.this.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "this" {
  name            = local.name
  cluster         = data.aws_ecs_cluster.this.arn
  task_definition = aws_ecs_task_definition.this.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.public.ids
    security_groups  = [aws_security_group.svc.id]
    assign_public_ip = true
  }

}
