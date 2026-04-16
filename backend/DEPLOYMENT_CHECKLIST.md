# Production Deployment Checklist for Vertex AI Fix

## Problem Summary
- **Issue**: Server 500 errors in Production AI Tutor (English Miss Janie)
- **Root Cause**: Vertex AI calls to `asia-east2` (Hong Kong) return 403 Forbidden (region doesn't support Generative AI)
- **Solution**: Route Vertex AI calls to `asia-east1` (Taiwan) while keeping Cloud Run infrastructure in Hong Kong

## Code Changes Applied

### 1. Modified `GenerativeAIService.js`
- **Region Fallback System**: Added support for multiple regions: `asia-east1` (primary), `asia-southeast1` (Singapore), `us-central1` (US)
- **No AI Studio Fallback**: Production environment strictly uses Vertex AI; will not fall back to API keys
- **Updated Model Mapping**: Added support for `gemini-3.1-flash` and `gemini-3.5-pro`
- **Service Account Authentication**: Uses Application Default Credentials (ADC) on Cloud Run

### 2. Created Diagnostic Tools
- `vertex_region_check.js`: Tests connectivity to all supported Vertex AI regions
- `production_env.example`: Environment variables template for production

### 3. Updated Model Queue
- Vertex AI now prioritizes `gemini-3.1-flash` and `gemini-3.5-pro` models
- Maintains compatibility with existing model aliases

## Pre-Deployment Validation

### 1. Local Testing
```bash
cd backend
# Test syntax
node -c services/GenerativeAIService.js

# Test region connectivity (requires service account credentials)
node vertex_region_check.js
```

### 2. Verify Service Account Permissions
Ensure the Cloud Run service account has:
- **Vertex AI User** role (`roles/aiplatform.user`)
- Access to all three regions: `asia-east1`, `asia-southeast1`, `us-central1`

### 3. Enable Required APIs
```bash
gcloud services enable aiplatform.googleapis.com --project=ace-it-production-1e0a4
```

## Deployment Steps

### Step 1: Build and Deploy to Cloud Run
```bash
# Navigate to project root
cd c:/Users/user/Documents/ace-it-web

# Build and deploy (region asia-east2 for Cloud Run)
gcloud run deploy ace-it-backend \
  --source ./backend \
  --region asia-east2 \
  --project ace-it-production-1e0a4 \
  --allow-unauthenticated \
  --set-env-vars="USE_AI_STUDIO_IN_PROD=false,VERTEX_LOCATION=asia-east1" \
  --remove-env-vars="GEMINI_API_KEY,GOOGLE_API_KEY"
```

### Step 2: Verify Deployment
```bash
# Check deployment status
gcloud run services describe ace-it-backend --region asia-east2 --project ace-it-production-1e0a4

# View logs for Vertex AI initialization
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=ace-it-backend" --project=ace-it-production-1e0a4 --limit=20
```

### Step 3: Health Check
Access the health endpoint:
```
https://ace-it-backend-[hash]-[region].a.run.app/health
```

### Step 4: Test AI Functionality
1. Navigate to https://ace-it-production-1e0a4.web.app/dashboard
2. Trigger any AI feature (chat, quest generation, etc.)
3. Check browser console and Cloud Run logs for errors

## Monitoring Post-Deployment

### Expected Log Messages
```
✅ Vertex AI Initialized (asia-east1)
[AIService] 🚀 Vertex AI Initialized (asia-east1)
[GenerativeAIService] Getting response text from gemini-3.1-flash...
```

### Error Indicators to Watch For
- `403 Forbidden`: Region still incorrect
- `400 Bad Request`: API key conflicts
- `500 Internal Server Error`: Service account permissions
- `404 Not Found`: Model not available in region

## Rollback Procedure

### Quick Rollback
```bash
# Redeploy previous revision
gcloud run deploy ace-it-backend \
  --image=[PREVIOUS_IMAGE_TAG] \
  --region asia-east2 \
  --project ace-it-production-1e0a4
```

### Emergency Fallback
If Vertex AI fails entirely:
1. Set `USE_AI_STUDIO_IN_PROD=true` environment variable
2. Add `GEMINI_API_KEY` environment variable
3. Redeploy (temporary fix while investigating Vertex AI issues)

## Verification Checklist

- [ ] Vertex AI API enabled in `asia-east1`, `asia-southeast1`, `us-central1`
- [ ] Service account `antigravity-tutor@ace-it-production-1e0a4.iam.gserviceaccount.com` has Vertex AI User role
- [ ] Cloud Run environment variables: `USE_AI_STUDIO_IN_PROD=false`
- [ ] Cloud Run environment variables: `VERTEX_LOCATION=asia-east1`
- [ ] API keys removed from production environment
- [ ] Deployment successful and service is running
- [ ] Health endpoint returns 200 OK
- [ ] AI features work in production dashboard
- [ ] Logs show Vertex AI region `asia-east1` initialization
- [ ] No 403/400 errors in logs

## Support Contacts

- **Cloud Run Issues**: Google Cloud Console > Cloud Run
- **Vertex AI Issues**: Google Cloud Console > Vertex AI > Model Garden
- **IAM Permissions**: Google Cloud Console > IAM & Admin
- **Logs**: Google Cloud Console > Logging

## Timeline
- **Deployment Time**: ~10 minutes
- **Verification Time**: ~15 minutes
- **Full Rollout**: Immediate (no gradual rollout needed)