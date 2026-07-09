/**
 * One-off script: creates (or resets) the official "Talko ✦" Firebase Auth
 * account plus its Firestore profile document. Safe to re-run — if the auth
 * user already exists it will just be left alone, and the Firestore profile
 * is upserted with merge.
 *
 * Run with: pnpm --filter @workspace/api-server exec tsx scripts/createOfficialAccount.ts
 */
import { randomBytes } from "node:crypto";
import { getAdminAuth, getAdminFirestore } from "../src/lib/firebaseAdmin";

const TALKO_OFFICIAL_UID = "talko-official";
const OFFICIAL_EMAIL = "talko.resmi.hesap@talko-app.internal";

async function main() {
  const auth = getAdminAuth();
  const db = getAdminFirestore();

  let password: string | null = null;
  let created = false;

  try {
    await auth.getUser(TALKO_OFFICIAL_UID);
    console.log("Official account already exists in Firebase Auth (uid: " + TALKO_OFFICIAL_UID + "). Leaving credentials unchanged.");
  } catch {
    password = randomBytes(9).toString("base64url");
    await auth.createUser({
      uid: TALKO_OFFICIAL_UID,
      email: OFFICIAL_EMAIL,
      password,
      displayName: "Talko",
      emailVerified: true,
    });
    created = true;
  }

  await db.collection("users").doc(TALKO_OFFICIAL_UID).set(
    {
      username: "Talko",
      usernameLower: "talko",
      bio: "Resmî Talko hesabı. Güncellemeler ve duyurular buradan paylaşılır.",
      isVerified: true,
      isOnline: true,
      createdAt: new Date("2024-01-01"),
      lastSeenAt: new Date(),
    },
    { merge: true },
  );

  console.log("Firestore profile for the official account is ready.");

  if (created) {
    console.log("\n=== Talko ✦ resmî hesap bilgileri (bir kez gösterilir) ===");
    console.log("E-posta: " + OFFICIAL_EMAIL);
    console.log("Şifre: " + password);
    console.log("===========================================================\n");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
