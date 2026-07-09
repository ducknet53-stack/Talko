import type { NextFunction, Request, Response } from "express";
import { getAdminAuth } from "./firebaseAdmin";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      firebaseUid?: string;
    }
  }
}

/** Verifies the Firebase ID token in the Authorization header and attaches req.firebaseUid. */
export async function requireFirebaseAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization") || req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token) {
    res.status(401).json({ error: "Kimlik doğrulama gerekli." });
    return;
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    req.firebaseUid = decoded.uid;
    next();
  } catch {
    res.status(401).json({ error: "Geçersiz veya süresi dolmuş oturum." });
  }
}
