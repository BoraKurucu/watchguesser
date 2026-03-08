import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as usersData from "../users_backup.json";

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

export const restoreUsers = onRequest(
  { region: "us-central1" },
  async (req, res) => {
    const users = (usersData as any).default || [];

    const results = [];

    for (const user of users) {
      try {
        await db.doc(`users/${user.uid}`).set({
          ...user,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        results.push({ uid: user.uid, status: "restored" });
        console.log(`Restored user: ${user.email} (${user.uid})`);
      } catch (error) {
        results.push({ uid: user.uid, status: "failed", error: error instanceof Error ? error.message : String(error) });
        console.error(`Failed to restore user ${user.uid}:`, error);
      }
    }

    res.json({ restored: results.filter(r => r.status === "restored").length, failed: results.filter(r => r.status === "failed").length, results });
  }
);
