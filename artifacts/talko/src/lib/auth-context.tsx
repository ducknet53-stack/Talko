import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { UserProfile } from "@/lib/chat";

type AuthContextValue = {
  firebaseUser: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [profileResolved, setProfileResolved] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthResolved(true);
      if (!user) {
        setProfile(null);
        setProfileResolved(true);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;
    setProfileResolved(false);
    const ref = doc(db, "users", firebaseUser.uid);
    const unsub = onSnapshot(ref, (snap) => {
      setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
      setProfileResolved(true);
    });
    return unsub;
  }, [firebaseUser]);

  // Presence: mark the current user online while the tab is open, and
  // offline (with a last-seen timestamp) when it's hidden or closed.
  useEffect(() => {
    if (!firebaseUser) return;
    const ref = doc(db, "users", firebaseUser.uid);

    const setOnline = () => updateDoc(ref, { isOnline: true }).catch(() => {});
    const setOffline = () =>
      updateDoc(ref, { isOnline: false, lastSeenAt: serverTimestamp() }).catch(
        () => {},
      );

    setOnline();
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") setOffline();
      else setOnline();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", setOffline);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", setOffline);
      setOffline();
    };
  }, [firebaseUser]);

  const logout = async () => {
    if (firebaseUser) {
      await updateDoc(doc(db, "users", firebaseUser.uid), {
        isOnline: false,
        lastSeenAt: serverTimestamp(),
      }).catch(() => {});
    }
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        loading: !authResolved || (!!firebaseUser && !profileResolved),
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
