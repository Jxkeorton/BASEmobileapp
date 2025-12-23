# Expo Go + Localhost Backend Issue

## Problem

Expo Go on iOS (or any physical device) cannot connect to `localhost:3000` backend.

## Why It Happens

- `localhost` on a physical device refers to the device itself, not your computer
- Your backend server needs to listen on network interfaces, not just `127.0.0.1`

## Solution: Two Required Changes

### 1. Update Mobile App to Use Computer's IP

In `services/kyClient.ts`:

```typescript
const devUrl = "http://192.168.0.68:3000"; // Replace with your computer's IP
```

To find your IP on Windows:

```powershell
ipconfig | Select-String -Pattern "IPv4.*192\.168"
```

### 2. Configure Backend to Listen on All Interfaces

Instead of:

```javascript
app.listen(3000);
```

Use:

```javascript
app.listen(3000, "0.0.0.0", () => {
  console.log("Server listening on all network interfaces");
});
```

## Quick Test

Backend is accessible from network:

```bash
curl http://192.168.0.68:3000/health
```

Should return a response (not "Could not connect to server")

## Temporary Workaround

Use production API during development:

```typescript
const devUrl = "https://basemapapi-production.up.railway.app";
```

## Device-Specific Notes

- **iOS Simulator**: `localhost` works ✓
- **Android Emulator**: Use `http://10.0.2.2:3000` (special address that maps to host's localhost)
- **Physical devices**: Must use computer's IP + backend must bind to `0.0.0.0`
