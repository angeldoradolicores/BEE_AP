'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  type User 
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

export interface UserData {
  uid: string
  nombre: string
  correo: string
  rol: 'usuario' | 'apicultor'
  fecha_registro: Date
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, nombre: string, rol: 'usuario' | 'apicultor') => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid))
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData)
        }
      } else {
        setUserData(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string, nombre: string, rol: 'usuario' | 'apicultor') => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password)
    
    // Create user document in Firestore
    const userData: UserData = {
      uid: newUser.uid,
      nombre,
      correo: email,
      rol,
      fecha_registro: new Date(),
    }
    
    await setDoc(doc(db, 'usuarios', newUser.uid), userData)
    setUserData(userData)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUserData(null)
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
