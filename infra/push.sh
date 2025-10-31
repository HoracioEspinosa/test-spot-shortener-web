#!/usr/bin/env bash
set -euo pipefail

# Helper to build, tag, and push an image to ECR
# Usage:
#   ./infra/push.sh [--region us-east-1] [--account 123456789012] \
#                   [--repo spot2-frontend-dev] [--tag dev] [--context .] [--platform linux/amd64]
# If --account is omitted, it will be derived via STS.
# If --tag is omitted, it uses `git rev-parse --short HEAD` or `dev` as fallback.

REGION="us-east-1"
REPO_NAME="spot2-frontend-dev"
CONTEXT="."
TAG=""
ACCOUNT_ID=""
PLATFORM="linux/amd64"
DOCKERFILE="Dockerfile"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --region)
      REGION="$2"; shift 2;;
    --account)
      ACCOUNT_ID="$2"; shift 2;;
    --repo)
      REPO_NAME="$2"; shift 2;;
    --tag)
      TAG="$2"; shift 2;;
    --context)
      CONTEXT="$2"; shift 2;;
    --platform)
      PLATFORM="$2"; shift 2;;
    --dockerfile)
      DOCKERFILE="$2"; shift 2;;
    *) echo "Unknown arg: $1" >&2; exit 1;;
  esac
done

# Validate repo name (must not include ':', ':' is only for image tag)
if [[ "$REPO_NAME" == *":"* ]]; then
  echo "❌ Invalid --repo '$REPO_NAME'. Do not include a tag (':...') in the repository name." >&2
  echo "   Use --repo spot2-frontend-dev and pass the tag separately with --tag dev" >&2
  exit 1
fi

# Resolve account id if not provided
if [[ -z "$ACCOUNT_ID" ]]; then
  ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
fi

# Pick tag
if [[ -z "$TAG" ]]; then
  if git rev-parse --short HEAD >/dev/null 2>&1; then
    TAG=$(git rev-parse --short HEAD)
  else
    TAG="dev"
  fi
fi

REGISTRY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
IMAGE_URI="${REGISTRY}/${REPO_NAME}:${TAG}"

# Login to ECR
echo "🔐 Logging in to ECR ${REGISTRY}"
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$REGISTRY"

# Ensure repository exists
if ! aws ecr describe-repositories --repository-names "$REPO_NAME" --region "$REGION" >/dev/null 2>&1; then
  echo "📦 Creating ECR repository: ${REPO_NAME}"
  aws ecr create-repository \
    --repository-name "$REPO_NAME" \
    --image-scanning-configuration scanOnPush=true \
    --region "$REGION" >/dev/null
else
  echo "ℹ️  ECR repository ${REPO_NAME} already exists"
fi

# Build and push
echo "🏗️  Building image: ${IMAGE_URI} (context=${CONTEXT}, platform=${PLATFORM}, dockerfile=${DOCKERFILE})"
docker build --platform "$PLATFORM" -f "$DOCKERFILE" -t "${REPO_NAME}:${TAG}" "$CONTEXT"

echo "🏷️  Tagging ${REPO_NAME}:${TAG} -> ${IMAGE_URI}"
docker tag "${REPO_NAME}:${TAG}" "${IMAGE_URI}"

echo "📤 Pushing ${IMAGE_URI}"
docker push "${IMAGE_URI}"

echo "✅ Pushed: ${IMAGE_URI}"
