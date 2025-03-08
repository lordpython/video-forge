import { type FirebaseApp, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// Import the direct Firebase configuration instead of using environment variables
import { firebaseConfig } from "./firebaseConfig";

// Export the firebase app instance in case it's needed by other modules.
export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);

// Export the firebase auth instance
export const firebaseAuth = getAuth(firebaseApp);
