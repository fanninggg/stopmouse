import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const env = import.meta.env

const firebaseConfig = {
  apiKey: env.VITE_API_KEY,
  authDomain: env.VITE_AUTH_DOMAIN,
  projectId: env.VITE_PROJECT_ID,
  storageBucket: env.VITE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_MESSAGING_SENDER_ID,
  appId: env.VITE_APP_ID,
  measurementId: env.VITE_MEASUREMENT_ID,
}

const envKeys = {
  apiKey: 'VITE_API_KEY',
  authDomain: 'VITE_AUTH_DOMAIN',
  projectId: 'VITE_PROJECT_ID',
  storageBucket: 'VITE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_MESSAGING_SENDER_ID',
  appId: 'VITE_APP_ID',
  measurementId: 'VITE_MEASUREMENT_ID',
}
const missing = Object.entries(firebaseConfig).filter(([, value]) => !value).map(([key]) => envKeys[key])
if (missing.length) {
  throw new Error(`Missing ${missing.join(', ')}. Copy .env.example to .env and fill in the web app values.`)
}

const app = initializeApp(firebaseConfig)

// Analytics is a no-op in unsupported browsers (private mode, blocked cookies).
isSupported().then(ok => {
  if (ok) getAnalytics(app)
})

export const auth = getAuth(app)
export const db = getFirestore(app)
export const signIn = () => signInWithPopup(auth, new GoogleAuthProvider())
export const signOut = () => firebaseSignOut(auth)
