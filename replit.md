# Talko

Talko is a modern, Turkish-language real-time messaging app with 1:1 chats, typing indicators, presence, image sharing, and an official "Talko ✦" broadcast account.

## Run & Operate

- `pnpm --filter @workspace/talko run dev` — run the web frontend
- `pnpm --filter @workspace/api-server run dev` — run the API server (image upload proxy)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-server exec tsx scripts/createOfficialAccount.ts` — create/repair the official "Talko ✦" Firebase Auth account + profile (safe to re-run)
- `pnpm --filter @workspace/api-server exec tsx scripts/deployFirestoreRules.ts` — publish `artifacts/talko/firestore.rules` to the live Firebase project
- Required env (public, safe client-side): `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`
- Required secrets (server-side only): `FIREBASE_SERVICE_ACCOUNT_KEY` (full service-account JSON), `IMGBB_API_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (`artifacts/talko`), Firebase client SDK (Auth + Firestore) — this app's real data lives in Firestore, not the workspace Postgres/Drizzle stack, so it bypasses the OpenAPI/Orval codegen pipeline entirely
- Backend: Express 5 (`artifacts/api-server`) — only handles the ImgBB image-upload proxy (keeps the ImgBB key server-side) and one-off admin scripts using `firebase-admin`
- Auth/DB: Firebase Auth (email/password) + Firestore, security rules in `artifacts/talko/firestore.rules`

## Where things live

- `artifacts/talko/src/lib/firebase.ts` — client SDK init, exports `auth`, `db`, `TALKO_OFFICIAL_UID`
- `artifacts/talko/src/lib/auth-context.tsx` — `AuthProvider`/`useAuth`, presence tracking, profile streaming
- `artifacts/talko/src/lib/chat.ts` — all Firestore data-layer helpers (conversations, messages, typing, presence, user search)
- `artifacts/talko/src/lib/upload.ts` — client-side image upload call to the api-server proxy
- `artifacts/talko/firestore.rules` — source of truth for security rules; deploy via the script above after edits
- `artifacts/api-server/src/lib/firebaseAdmin.ts` — Admin SDK init from `FIREBASE_SERVICE_ACCOUNT_KEY`
- `artifacts/api-server/src/routes/uploadImage.ts` — `POST /api/upload-image`, forwards to ImgBB
- `artifacts/api-server/scripts/` — one-off admin scripts (official account creation, rules deploy), run via `tsx`, not permanent routes

## Architecture decisions

- Conversation IDs are deterministic (`sorted-uid-pair` joined with `__`), so a 1:1 chat has exactly one canonical doc regardless of who starts it.
- The official "Talko ✦" account has a fixed uid (`talko-official`) baked into the client so it can be recognized without a lookup, and its avatar is rendered from the bundled logo asset (not a stored URL) to avoid depending on a stable external image URL.
- Firestore security rules block any client from writing a message with `senderId` set to the official uid — only the admin SDK (server-side script) can post as Talko, bypassing rules.
- Presence is approximated via Firestore doc writes on visibility/mount/unload events; there is no reliable server-side disconnect hook, so a user can appear "online" briefly after closing the tab ungracefully.

## Product

- Email/password auth (register, login, password reset) in Turkish
- 1:1 chat list with unread counts, online status, last-message preview
- Chat view: real-time messages, typing indicator, image upload, emoji picker
- New chat via username search
- Every new user gets an auto-seeded welcome conversation with the official Talko account (read-only — users cannot reply to it)
- Profile page: edit username/bio, change avatar, light/dark/system theme toggle, logout

## User preferences

- Do not push to GitHub or prepare deployment until the app is fully working and tested end-to-end.

## Gotchas

- Vite requires an explicit `define` block (see `vite.config.ts`) to map selected server env vars to `import.meta.env.VITE_FIREBASE_*` — never blanket-expose all env vars to the client, since `FIREBASE_SERVICE_ACCOUNT_KEY` must stay server-only.
- After editing `firestore.rules`, you must re-run the deploy script — there is no file-watcher/auto-sync to the live Firebase project.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
