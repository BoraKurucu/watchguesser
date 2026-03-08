import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

export const grantPremium = onRequest(
  { region: "us-central1" },
  async (req, res) => {
    const uid = process.env.ADMIN_UID;
    if (!uid) {
      res.status(500).json({ error: "ADMIN_UID not configured" });
      return;
    }
    const now = new Date();
    const until = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await db.doc(`users/${uid}`).set({
      isPremium: true,
      premiumSince: now.toISOString(),
      premiumUntil: until.toISOString(),
    }, { merge: true });

    res.json({ success: true, premiumUntil: until.toISOString() });
  }
);
