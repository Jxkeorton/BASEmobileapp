# Dev set-up docs

## Problem

Expo Go on iOS (or any physical device) cannot connect to `localhost:3000` backend.

### 1. Update Mobile App to Use Computer's IP

In `services/kyClient.ts`:

```typescript
const devUrl = "http://[YOUR IP]:3000";
```

To find your IP on Windows:

```powershell
ipconfig | Select-String -Pattern "IPv4.*192\.168"
```

## 2. Run the API - Quick Test

Backend is accessible from network:

```bash
curl http://192.168.0.68:3000/health
```

Should return a response (not "Could not connect to server")

## 3. Run mobile app

Should be all set

## Point to prod if needed

Use production API during development:

```typescript
const devUrl = "https://basemapapi-production.up.railway.app";
```
