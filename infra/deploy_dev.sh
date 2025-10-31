#!/usr/bin/env bash
set -euo pipefail

# Deploy frontend (dev) to ECS using Terraform
# Minimal usage (only pass backend IP):
#   ./infra/deploy_dev.sh 34.201.25.56
#
# Environment variables used (no -var flags needed):
#   AWS_REGION            (default: us-east-1)
#   ECS_CLUSTER_NAME      (required) e.g. spot2-dev
#   IMAGE_URL             (required) e.g. <acct>.dkr.ecr.<region>.amazonaws.com/spot2-frontend-dev:<tag>
#   PROJECT_NAME          (default: spot2-frontend-dev)
#   BACKEND_PORT          (default: 8000)
#   BACKEND_URL           (optional) if set, IP arg is not required
#
# Notes:
# - Terraform reads TF_VAR_* env vars automatically.
# - VPC/Subnets are discovered automatically (default VPC and its subnets).

REGION=${AWS_REGION:-us-east-1}
PROJECT_NAME=${PROJECT_NAME:-spot2-frontend-dev}
CLUSTER_NAME=${ECS_CLUSTER_NAME:-}
IMAGE_URL=${IMAGE_URL:-}
BACKEND_URL=${BACKEND_URL:-}
BACKEND_PORT=${BACKEND_PORT:-8000}
TF_DIR="$(cd "$(dirname "$0")/terraform/dev" && pwd)"
# Service name defaults to project name unless overridden
SERVICE_NAME=${SERVICE_NAME:-$PROJECT_NAME}

function usage() {
  sed -n '1,80p' "$0" | sed 's/^# \{0,1\}//'
}

# Allow passing a single positional arg as backend IP or use flags
BACKEND_IP=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --backend-ip)
      BACKEND_IP="$2"; shift 2;;
    --backend-url)
      BACKEND_URL="$2"; shift 2;;
    -h|--help)
      usage; exit 0;;
    *)
      if [[ -z "$BACKEND_IP" ]]; then
        BACKEND_IP="$1"; shift 1;
      else
        echo "Unknown arg: $1" >&2; usage; exit 1;
      fi;;
  esac
done

if [[ -z "$BACKEND_URL" ]]; then
  if [[ -z "${BACKEND_IP}" ]]; then
    echo "❌ Missing backend IP or BACKEND_URL. Pass an IP (e.g. ./infra/deploy_dev.sh 34.201.25.56) or set BACKEND_URL." >&2
    exit 1
  fi
  BACKEND_URL="http://${BACKEND_IP}:${BACKEND_PORT}"
fi

# Validate required env vars
if [[ -z "$CLUSTER_NAME" ]]; then
  echo "❌ ECS_CLUSTER_NAME env var is required (e.g. export ECS_CLUSTER_NAME=spot2-dev)" >&2
  exit 1
fi
if [[ -z "$IMAGE_URL" ]]; then
  echo "ℹ️ IMAGE_URL not set. Building and pushing image via ./infra/push.sh ..."
  PUSH_OUT=$("$(cd "$(dirname "$0")" && pwd)"/push.sh --region "$REGION" 2>&1 | tee /dev/stderr || true)
  if echo "$PUSH_OUT" | grep -q "✅ Pushed:"; then
    IMAGE_URL=$(echo "$PUSH_OUT" | awk '/✅ Pushed:/ {print $3}' | tail -n1)
    if [[ -z "$IMAGE_URL" ]]; then
      echo "❌ Could not parse IMAGE_URL from push output" >&2; exit 1
    fi
    echo "✅ Using IMAGE_URL=$IMAGE_URL"
  else
    echo "❌ Failed to push image automatically. Set IMAGE_URL env var and retry." >&2
    exit 1
  fi
fi

# Export TF_VAR_* for Terraform auto var loading
export TF_VAR_aws_region="$REGION"
export TF_VAR_project_name="$PROJECT_NAME"
export TF_VAR_cluster_name="$CLUSTER_NAME"
export TF_VAR_image_url="$IMAGE_URL"
export TF_VAR_backend_url="$BACKEND_URL"

echo "🚀 Deploying to ECS (region=$REGION, cluster=$CLUSTER_NAME)"
(
  cd "$TF_DIR"
  terraform init
  # Clean up any previous ALB resources lingering in state (removed from code)
  set +e
  echo "ℹ️ Current state addresses (if any):"
  terraform state list || true

  echo "🧹 Force-remove known legacy addresses (ignore errors if absent)"
  terraform state rm aws_lb.this >/dev/null 2>&1 || true
  terraform state rm aws_lb_target_group.this >/dev/null 2>&1 || true
  terraform state rm aws_lb_listener.http >/dev/null 2>&1 || true
  terraform state rm aws_ecs_service.this >/dev/null 2>&1 || true

  # Also remove any remaining matching addresses defensively
  MATCHES=$(terraform state list | grep -E '(aws_lb|aws_alb|aws_lb_target_group|aws_alb_target_group|aws_lb_listener|aws_alb_listener|aws_lb_target_group_attachment|aws_ecs_service)' || true)
  if [[ -n "$MATCHES" ]]; then
    echo "🧹 Removing legacy ALB and service resources from state (extra)"
    for addr in $MATCHES; do
      echo " - terraform state rm $addr"
      terraform state rm "$addr" >/dev/null 2>&1 || true
    done
  fi
  set -e

  # Ensure no conflicting pre-existing ECS service with same name (legacy with ALB)
  echo "ℹ️ Checking for existing ECS service '$SERVICE_NAME' in cluster '$CLUSTER_NAME'"
  EXISTS=$(aws ecs describe-services --cluster "$CLUSTER_NAME" --services "$SERVICE_NAME" --region "$REGION" --query 'services[0].status' --output text 2>/dev/null || true)
  if [[ "$EXISTS" == "ACTIVE" || "$EXISTS" == "DRAINING" ]]; then
    echo "🧹 Found existing service. Draining tasks and deleting to avoid conflicts..."
    aws ecs update-service --cluster "$CLUSTER_NAME" --service "$SERVICE_NAME" --desired-count 0 --region "$REGION" >/dev/null 2>&1 || true
    # Wait briefly for tasks to stop
    sleep 10
    aws ecs delete-service --cluster "$CLUSTER_NAME" --service "$SERVICE_NAME" --force --region "$REGION" >/dev/null 2>&1 || true
    echo "✅ Existing service deletion requested. Continuing with Terraform apply."
  fi

  terraform plan -refresh=false
  terraform apply -refresh=false -auto-approve
)

# Try to discover the public IP of the running task (no ALB scenario)
SERVICE_NAME="$PROJECT_NAME"
echo "🔎 Attempting to discover public IP for service '$SERVICE_NAME' in cluster '$CLUSTER_NAME'..."
TASK_ARN=$(aws ecs list-tasks --cluster "$CLUSTER_NAME" --service-name "$SERVICE_NAME" --region "$REGION" --query 'taskArns[0]' --output text || true)
if [[ -n "$TASK_ARN" && "$TASK_ARN" != "None" ]]; then
  ENI_ID=$(aws ecs describe-tasks --cluster "$CLUSTER_NAME" --tasks "$TASK_ARN" --region "$REGION" \
    --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text || true)
  if [[ -n "$ENI_ID" && "$ENI_ID" != "None" ]]; then
    PUBLIC_IP=$(aws ec2 describe-network-interfaces --network-interface-ids "$ENI_ID" --region "$REGION" \
      --query 'NetworkInterfaces[0].Association.PublicIp' --output text || true)
    if [[ -n "$PUBLIC_IP" && "$PUBLIC_IP" != "None" ]]; then
      echo "✅ Frontend reachable (once task is healthy): http://${PUBLIC_IP}"
    else
      echo "⚠️ Could not determine Public IP from ENI ($ENI_ID). The task may still be starting, or no public IP assigned."
    fi
  else
    echo "⚠️ Could not get ENI ID from task. The task may still be provisioning."
  fi
else
  echo "⚠️ Could not find a running task yet. It may take a minute for ECS to start the task."
fi

echo "✅ Done. Frontend service created/updated in ECS."
