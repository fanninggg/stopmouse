import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const env = import.meta.env
const app = initializeApp({
  apiKey: env.VITE_API_KEY,
  authDomain: env.VITE_AUTH_DOMAIN,
  projectId: env.VITE_PROJECT_ID,
  appId: env.VITE_APP_ID,
})

export const auth = getAuth(app)
export const db = getFirestore(app)
export const signIn = () => signInWithPopup(auth, new GoogleAuthProvider())
