---
name: Firebase integration in Talko monorepo
description: Setup patterns, constraints, and pitfalls for Firebase Auth + Firestore in this pnpm workspace
---

## No Replit connector for Firebase
Firebase has no Replit-managed connector. Client config (API key etc.) is injected via `Vite define` mapping `import.meta.env.VITE_FIREBASE_*` → `process.env.FIREBASE_*` in `artifacts/talko/vite.config.ts`. Service-account JSON lives in the `FIREBASE_SERVICE_ACCOUNT_KEY` Replit secret (API server only).

**Why:** Keeps public client config visible to Vite at build time while keeping the service account strictly server-side.

## firebase-admin must be externalized in esbuild
`artifacts/api-server/build.mjs` has `firebase-admin` in the `external` list. Do not bundle it.

## Headless Firestore rules deployment
Rules are deployed via the Firebase Rules REST API using `google-auth-library` (`GoogleAuth`, scope `https://www.googleapis.com/auth/firebase`). Script: `artifacts/api-server/scripts/deployFirestoreRules.ts`. Must re-run this script after editing `artifacts/talko/firestore.rules`. Run via `pnpm exec tsx scripts/deployFirestoreRules.ts` from the api-server directory.

## Official account (talko-official) — trusted-server-only writes
Firestore rules forbid any client from writing messages as `talko-official`. Welcome conversation is created server-side via `POST /api/welcome-conversation` (Admin SDK, inside a Firestore transaction with a deterministic message doc ID `"welcome"` for retry safety). Frontend `Register.tsx` calls this endpoint with a Firebase ID token after signup.

**Why:** Client SDK cannot impersonate the official account by design. Admin SDK bypasses rules.

## Presence / disconnect hooks
Firebase Realtime Database (for `onDisconnect`) is not wired up. Online/offline presence is tracked via visibility-change events writing to Firestore, which means it does not auto-clear on hard disconnect.

## Auth middleware pattern
`artifacts/api-server/src/lib/authMiddleware.ts` — `requireFirebaseAuth` reads `Authorization: Bearer <token>`, calls `getAdminAuth().verifyIdToken()`, attaches `req.firebaseUid`. Used on `/api/upload-image` and `/api/welcome-conversation`.

## Firestore rules — conversation update split
`isValidMetadataUpdate()` in the rules splits into two strictly disjoint cases:
- **isSendMessageUpdate**: `lastMessageText/At/SenderId + unreadCount` keys only; `lastMessageSenderId == request.auth.uid`; recipient's unread increments by exactly 1; sender's unread unchanged.
- **isMarkReadUpdate**: only `unreadCount` key; own count becomes 0; other's unchanged.
Helper functions `conversationParticipants()` are duplicated inside both `/messages` and `/typing` match blocks (Firestore rules scoping requires this).

## sendMessage uses atomic increment
`chat.ts` `sendMessage()` uses `increment(1)` from `firebase/firestore` for the recipient's unread counter — never read-then-write (avoids race conditions).
