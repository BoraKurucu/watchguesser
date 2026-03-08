import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { grantPremium as grantPremiumFunc } from "./grantPremium";
import { restoreUsers as restoreUsersFunc } from "./restoreUsers";
import * as usersData from "../users_backup.json";

// Initialize admin if not already
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// Export existing functions from their files
export const grantPremium = grantPremiumFunc;
export const restoreUsers = restoreUsersFunc;

// Re-implement checkUsers and restoreMissingUsers to be secure
export const checkUsers = onRequest({ region: "us-central1" }, async (req, res) => {
    try {
        const snapshot = await db.collection("users").get();
        const users: any[] = [];
        snapshot.forEach(doc => {
            users.push({
                uid: doc.id,
                email: doc.data().email,
                displayName: doc.data().displayName,
                isPremium: doc.data().isPremium || false
            });
        });
        res.json({ users: users.sort((a, b) => (a.email || "").localeCompare(b.email || "")) });
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

export const restoreMissingUsers = onRequest({ region: "us-central1" }, async (req, res) => {
    const users = (usersData as any).default || usersData || [];
    const results = [];

    for (const user of users) {
        try {
            await db.doc(`users/${user.uid}`).set({
                ...user,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });

            results.push({ uid: user.uid, status: "restored" });
            console.log(`Restored user: ${user.email} (${user.uid})`);
        } catch (error) {
            results.push({ uid: user.uid, status: "failed", error: error instanceof Error ? error.message : String(error) });
            console.error(`Failed to restore user ${user.uid}:`, error);
        }
    }

    res.json({
        restored: results.filter(r => r.status === "restored").length,
        failed: results.filter(r => r.status === "failed").length,
        results
    });
});
