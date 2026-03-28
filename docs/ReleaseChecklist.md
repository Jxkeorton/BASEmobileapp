# Release Checklist

## 1) Versioning And Build Numbers

- Confirm app version in [app.json](../app.json) is the release version.
- Confirm runtimeVersion policy is appVersion for both iOS and Android.
- Confirm EAS production profile has autoIncrement enabled.

## 2) Required EAS Secrets

- Verify production secrets exist in EAS:
  - EXPO_PUBLIC_API_BASE_URL
  - EXPO_PUBLIC_API_KEY
  - EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN
  - EXPO_PUBLIC_REVENUECAT_APPLE_KEY
  - EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY

## 3) Local Quality Gates

- Run lint: `pnpm lint`
- Run a clean production build locally if needed for smoke testing:
  - iOS: `eas build --platform ios --profile production`
  - Android: `eas build --platform android --profile production`

## 4) OTA And Channels

- Confirm production profile uses the production channel.
- Confirm updates URL and EAS project ID are correct.
- Publish OTA only after store binary compatibility is verified.

## 5) Store Readiness

- iOS:
  - Verify App Store Connect metadata, screenshots, privacy labels.
  - Verify in-app purchases/subscriptions are approved and attached.
- Android:
  - Verify Play Console release notes and target track.
  - Verify subscriptions/products are active and mapped.

## 6) Final Smoke Test

- Install release build on a real iOS device and Android device.
- Verify login, token refresh, map rendering, purchases, image upload, and logbook submission.
- Verify API errors show friendly messages and app does not crash on network failures.

## 7) Rollout

- Start with staged rollout where possible.
- Monitor crash/error metrics and payment conversion after release.
- Keep a rollback plan:
  - Mobile store rollback path.
  - OTA rollback path.
