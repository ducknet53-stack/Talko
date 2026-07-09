import {
  addDoc,
  collection,
  doc,
  type DocumentData,
  endAt,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAt,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, TALKO_OFFICIAL_UID } from "@/lib/firebase";
import { apiUrl } from "@/lib/apiUrl";

export type UserProfile = {
  id: string;
  username: string;
  usernameLower: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: Timestamp | null;
  isOnline: boolean;
  lastSeenAt: Timestamp | null;
  isVerified?: boolean;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  createdAt: Timestamp | null;
};

export type Conversation = {
  id: string;
  participants: string[];
  lastMessageText: string;
  lastMessageAt: Timestamp | null;
  lastMessageSenderId?: string;
  isOfficial?: boolean;
  unreadCount?: Record<string, number>;
};

function conversationIdFor(uidA: string, uidB: string) {
  return [uidA, uidB].sort().join("__");
}

/** Ensures a 1:1 conversation document exists between the two users. */
export async function ensureConversation(uidA: string, uidB: string) {
  const id = conversationIdFor(uidA, uidB);
  const ref = doc(db, "conversations", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      participants: [uidA, uidB].sort(),
      lastMessageText: "",
      lastMessageAt: serverTimestamp(),
      isOfficial: uidA === TALKO_OFFICIAL_UID || uidB === TALKO_OFFICIAL_UID,
      unreadCount: { [uidA]: 0, [uidB]: 0 },
    });
  }
  return id;
}

/**
 * Asks the trusted backend (Admin SDK) to create the welcome conversation +
 * message from the official Talko account for a new user. This can't be
 * done directly from the client: Firestore rules correctly forbid any
 * client from writing a message as the official account, so this step must
 * run server-side with elevated privileges.
 */
export async function createWelcomeConversation(idToken: string) {
  const res = await fetch(apiUrl("api/welcome-conversation"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
  if (!res.ok) {
    throw new Error("Karşılama sohbeti oluşturulamadı.");
  }
}

export function listenToConversations(
  uid: string,
  cb: (conversations: Conversation[]) => void,
) {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", uid),
    orderBy("lastMessageAt", "desc"),
  );
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) }) as Conversation),
    );
  });
}

export function listenToMessages(
  conversationId: string,
  cb: (messages: ChatMessage[]) => void,
) {
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) }) as ChatMessage),
    );
  });
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  recipientId: string,
  content: { text?: string; imageUrl?: string },
) {
  await addDoc(collection(db, "conversations", conversationId, "messages"), {
    senderId,
    ...content,
    createdAt: serverTimestamp(),
  });
  const preview = content.text || (content.imageUrl ? "📷 Fotoğraf" : "");
  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessageText: preview,
    lastMessageAt: serverTimestamp(),
    lastMessageSenderId: senderId,
    [`unreadCount.${recipientId}`]: increment(1),
  });
}

export async function markConversationRead(conversationId: string, uid: string) {
  await updateDoc(doc(db, "conversations", conversationId), {
    [`unreadCount.${uid}`]: 0,
  });
}

/** Typing indicator: one doc per conversation, keyed by uid -> last-typed timestamp. */
export function setTyping(conversationId: string, uid: string, isTyping: boolean) {
  return setDoc(
    doc(db, "conversations", conversationId, "typing", uid),
    { isTyping, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export function listenToTyping(
  conversationId: string,
  otherUid: string,
  cb: (isTyping: boolean) => void,
) {
  return onSnapshot(
    doc(db, "conversations", conversationId, "typing", otherUid),
    (snap) => {
      const data = snap.data();
      if (!data?.isTyping) return cb(false);
      const updatedAt = (data.updatedAt as Timestamp | undefined)?.toDate();
      const isRecent = updatedAt ? Date.now() - updatedAt.getTime() < 5000 : false;
      cb(isRecent);
    },
  );
}

export function listenToUser(uid: string, cb: (user: UserProfile | null) => void) {
  return onSnapshot(doc(db, "users", uid), (snap) => {
    cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as UserProfile) : null);
  });
}

/** Prefix search over usernames (case-insensitive via a lowercased mirror field). */
export async function searchUsers(usernameQuery: string, excludeUid: string) {
  const lower = usernameQuery.trim().toLowerCase();
  if (!lower) return [];
  const q = query(
    collection(db, "users"),
    orderBy("usernameLower"),
    startAt(lower),
    endAt(lower + "\uf8ff"),
    limit(10),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as UserProfile)
    .filter((u) => u.id !== excludeUid);
}

export { conversationIdFor };
