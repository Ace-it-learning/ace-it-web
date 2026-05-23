# Ace It! PROD Deployment Checklist — Azure Cloud

## Target Architecture
- **Frontend**: Azure Static Web Apps (East Asia)
- **Backend**: Azure App Service — Linux Container (East Asia)
- **Database**: Azure Cosmos DB (SQL API)
- **Storage**: Azure Blob Storage
- **Auth**: Azure Entra ID (MSAL)
- **AI**: Deepseek API
- **Email**: Azure Communication Services

---

## Pre-Deployment Validation

### 1. Local Testing
```bash
cd backend
node -c server.js
node -c services/GenerativeAIService.js
```

### 2. Verify Environment Variables
Ensure `/backend/.env` (PROD) contains:
```env
NODE_ENV=production
AUTH_PROVIDER=entra
DATA_PROVIDER=cosmos
STORAGE_PROVIDER=azure
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=...
STRIPE_SECRET_KEY=...
AZURE_COSMOS_ENDPOINT=...
AZURE_COSMOS_KEY=...
AZURE_STORAGE_CONNECTION_STRING=...
AZURE_COMMUNICATION_CONNECTION_STRING=...
AZURE_SENDER_EMAIL=...
```

### 3. Verify Azure Resources
- [ ] Resource Group `rg-aceit-prod` exists in East Asia.
- [ ] Cosmos DB account + containers (`users`, `questResults`, `mockSummaries`, `chatSessions`, `usage`) created.
- [ ] Blob Storage account + containers (`avatars`, `audio-cache`, `user-uploads`, `exam-assets`) created.
- [ ] Azure App Service Plan (Linux, P1v2 or higher) created.
- [ ] Azure Static Web App created.
- [ ] Azure Communication Services + verified sender domain.
- [ ] (Optional) Azure Key Vault provisioned and secrets imported.

---

## Deployment Steps

### Step 1: Build & Deploy Backend
```bash
cd backend

# Build Docker image
docker build -t aceit-backend-prod:latest .

# Option A: Deploy via Azure Container Registry (ACR)
az acr login --name <your-acr-name>
docker tag aceit-backend-prod:latest <your-acr-name>.azurecr.io/aceit-backend-prod:latest
docker push <your-acr-name>.azurecr.io/aceit-backend-prod:latest

# Update App Service to use the new image
az webapp config container set \
  --name ace-it-backend-prod \
  --resource-group rg-aceit-prod \
  --docker-custom-image-name <your-acr-name>.azurecr.io/aceit-backend-prod:latest \
  --docker-registry-server-url https://<your-acr-name>.azurecr.io

# Option B: Zip deploy (if not using Docker on App Service)
# zip -r deploy-prod.zip . -x "node_modules/*" "tests/*" "scripts/*" "*.log"
# az webapp deployment source config-zip \
#   --resource-group rg-aceit-prod \
#   --name ace-it-backend-prod \
#   --src ./deploy-prod.zip
```

### Step 2: Verify Backend Deployment
```bash
# Check deployment status
az webapp show --name ace-it-backend-prod --resource-group rg-aceit-prod --query state

# View logs
az webapp log tail --name ace-it-backend-prod --resource-group rg-aceit-prod
```

Access the health endpoint:
```
https://ace-it-backend-prod.azurewebsites.net/
```

Expected log messages:
```
✅ PRODUCTION BACKEND ACTIVE (Azure Stack)
🔐 Auth Provider: entra
🗄️  Data Provider: cosmos
🤖 AI Provider: deepseek
```

### Step 3: Build & Deploy Frontend
```bash
cd frontend

# Ensure .env.production is updated with correct VITE_API_URL and Entra values
npm run build

# Deploy to Azure Static Web Apps
swa deploy ./dist --env production --deployment-token <your-swa-token>
```

Or via Azure CLI:
```bash
az staticwebapp upload \
  --name ace-it-prod \
  --source ./dist \
  --token <your-swa-token>
```

### Step 4: Configure Custom Domain (Optional)
1. Add custom domain to Azure Static Web Apps (e.g., `app.aceit-learning.com`).
2. Add custom domain to Azure App Service (e.g., `api.aceit-learning.com`).
3. Update `frontend/.env.production` `VITE_API_URL` and `VITE_ENTRA_REDIRECT_URI`.
4. Update Azure Entra app registration redirect URIs.
5. Re-deploy frontend.

---

## Post-Deployment Validation

### Functional Checklist
- [ ] Entra login flow works end-to-end.
- [ ] AI tutor chat responds (Deepseek API).
- [ ] File upload writes to Azure Blob Storage.
- [ ] User progress persists in Cosmos DB.
- [ ] Stripe payment flow completes.
- [ ] WebSocket real-time STT connects.
- [ ] ACS email sends successfully.
- [ ] No CORS errors in browser console.
- [ ] Rate limiting active (150 req/15min).

### Error Indicators to Watch
- `500 Internal Server Error`: Check App Service logs (`az webapp log tail`).
- `403 Forbidden`: CORS or auth middleware issue.
- `401 Unauthorized`: Entra token validation failure.
- Deepseek API errors: Check `DEEPSEEK_API_KEY` and quota.

---

## Rollback Procedure

### Quick Rollback
If Azure deployment fails:
1. Revert DNS to Firebase Hosting + Cloud Run (if still active).
2. Scale Cloud Run service back up: `gcloud run services update ace-it-backend --min-instances 1`.
3. Re-deploy previous `frontend/dist` to Firebase Hosting if needed.

### Database Rollback
If Cosmos DB issues arise:
1. Temporarily switch backend `DATA_PROVIDER=firebase` (requires Firestore still accessible).
2. Restart App Service.
3. Investigate and fix Cosmos DB connectivity or schema issues.

---

## Support & Monitoring

- **Azure Portal**: Monitor App Service, Cosmos DB, and Static Web Apps.
- **Application Insights**: Enable for App Service to track requests, failures, and performance.
- **Log Stream**: `az webapp log tail --name ace-it-backend-prod --resource-group rg-aceit-prod`
- **Cosmos DB Metrics**: Monitor RU/s consumption and throttled requests.

---

## Timeline
- **Backend Deployment**: ~15 minutes
- **Frontend Deployment**: ~10 minutes
- **Validation**: ~20 minutes
- **Custom Domain + DNS**: ~30 minutes (depends on propagation)
