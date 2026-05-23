#!/usr/bin/env bash
# Azure PROD Deployment Script for Ace It! Backend
# Prerequisites: Azure CLI (az) installed and authenticated, Docker installed

set -e

RESOURCE_GROUP="rg-aceit-prod"
APP_NAME="ace-it-backend-prod"
ACR_NAME="<your-acr-name>"          # Replace with your Azure Container Registry name
IMAGE_NAME="aceit-backend-prod"
LOCATION="eastasia"

echo "=========================================="
echo "  Ace It! — Azure PROD Backend Deploy"
echo "=========================================="

# 1. Build Docker image
echo "[1/4] Building Docker image..."
cd "$(dirname "$0")/../backend"
docker build -t "${IMAGE_NAME}:latest" .

# 2. Push to ACR
echo "[2/4] Pushing to Azure Container Registry..."
az acr login --name "${ACR_NAME}"
docker tag "${IMAGE_NAME}:latest" "${ACR_NAME}.azurecr.io/${IMAGE_NAME}:latest"
docker push "${ACR_NAME}.azurecr.io/${IMAGE_NAME}:latest"

# 3. Update App Service container
echo "[3/4] Updating Azure App Service container..."
az webapp config container set \
  --name "${APP_NAME}" \
  --resource-group "${RESOURCE_GROUP}" \
  --docker-custom-image-name "${ACR_NAME}.azurecr.io/${IMAGE_NAME}:latest" \
  --docker-registry-server-url "https://${ACR_NAME}.azurecr.io"

# 4. Restart and verify
echo "[4/4] Restarting App Service..."
az webapp restart --name "${APP_NAME}" --resource-group "${RESOURCE_GROUP}"

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo "Backend URL: https://${APP_NAME}.azurewebsites.net"
echo "Logs: az webapp log tail --name ${APP_NAME} --resource-group ${RESOURCE_GROUP}"
