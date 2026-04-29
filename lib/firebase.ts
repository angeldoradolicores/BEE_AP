import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDk2NxiJSgcZISwu4WeS0DmaxThfimVqZw",
  authDomain: "bee-ap-92b70.firebaseapp.com",
  projectId: "bee-ap-92b70",
  storageBucket: "bee-ap-92b70.firebasestorage.app",
  messagingSenderId: "616584830575",
  appId: "1:616584830575:web:150165a39e0f97de44379a",
}

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
