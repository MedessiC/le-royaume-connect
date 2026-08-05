import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.appId
);

const app = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

const storage = app ? getStorage(app) : null;

export async function uploadToFirebaseStorage(file: File, folder: string) {
  if (!storage) {
    throw new Error(
      "Firebase Storage n'est pas configuré. Ajoutez les variables VITE_FIREBASE_* dans votre .env."
    );
  }

  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/\s+/g, "_");
  const fullPath = `${folder.replace(/\/+$/, "")}/${timestamp}_${sanitizedFileName}`;
  const storageRef = ref(storage, fullPath);
  const uploadTask = uploadBytesResumable(storageRef, file);

  await new Promise<void>((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      () => {},
      (error) => reject(error),
      () => resolve()
    );
  });

  return getDownloadURL(uploadTask.snapshot.ref);
}
