import { Router, type IRouter } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { requireFirebaseAuth } from "../lib/authMiddleware";
import { getAdminFirestore } from "../lib/firebaseAdmin";
import { logger } from "../lib/logger";

const router: IRouter = Router();
const TALKO_OFFICIAL_UID = "talko-official";
const WELCOME_TEXT =
  "Talko'ya hoş geldin! 🎉 İletişimin en hızlı ve güvenli yolu burada başlıyor.";

function conversationIdFor(uidA: string, uidB: string) {
  return [uidA, uidB].sort().join("__");
}

// Creates (idempotently) the official welcome conversation for the
// authenticated user. Runs with Admin SDK privileges because Firestore
// security rules correctly forbid any client from writing messages as the
// official Talko account.
router.post("/welcome-conversation", requireFirebaseAuth, async (req, res) => {
  const uid = req.firebaseUid!;
  if (uid === TALKO_OFFICIAL_UID) {
    res.status(400).json({ error: "Geçersiz istek." });
    return;
  }

  const db = getAdminFirestore();
  const conversationId = conversationIdFor(TALKO_OFFICIAL_UID, uid);
  const conversationRef = db.collection("conversations").doc(conversationId);

  try {
    // Use a transaction so that concurrent registration calls cannot
    // produce duplicate welcome conversations or messages.
    let created = false;
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(conversationRef);
      if (snap.exists) return; // already created — idempotent
      created = true;
      tx.set(conversationRef, {
        participants: [TALKO_OFFICIAL_UID, uid].sort(),
        lastMessageText: WELCOME_TEXT,
        lastMessageAt: FieldValue.serverTimestamp(),
        lastMessageSenderId: TALKO_OFFICIAL_UID,
        isOfficial: true,
        unreadCount: { [uid]: 1, [TALKO_OFFICIAL_UID]: 0 },
      });
      // Use a deterministic message doc ID so a retried transaction is safe
      const msgRef = conversationRef.collection("messages").doc("welcome");
      tx.set(msgRef, {
        senderId: TALKO_OFFICIAL_UID,
        text: WELCOME_TEXT,
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    res.json({ conversationId, created });
  } catch (err) {
    logger.error({ err }, "Failed to create welcome conversation");
    res.status(500).json({ error: "Karşılama sohbeti oluşturulamadı." });
  }
});

export default router;
