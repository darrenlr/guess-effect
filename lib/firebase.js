// Firebase is only needed to record results and read the global stats, so it is
// loaded on demand instead of being part of every page's JavaScript.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let ready;

// Resolves to { db, fs } where fs is the firebase/firestore module.
export function getFirestoreClient() {
  if (!ready) {
    ready = Promise.all([import("firebase/app"), import("firebase/firestore")]).then(
      ([{ initializeApp, getApps, getApp }, fs]) => {
        const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        return { db: fs.getFirestore(app), fs };
      }
    );
  }
  return ready;
}
