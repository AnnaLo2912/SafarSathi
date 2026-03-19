import { createContext, useContext, useEffect, useState } from 'react'
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Signup with email/password
  async function signup(email, password, role, name) {
    const result = await createUserWithEmailAndPassword(
      auth, email, password
    )
    // Save user profile to Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid,
      email,
      name,
      role, // 'tourist' or 'guide'
      createdAt: new Date().toISOString(),
      // Guide specific
      certificateStatus: role === 'guide' ? 'pending' : null,
      // Tourist specific
      walletUSD: role === 'tourist' ? 0 : null,
      walletINR: role === 'tourist' ? 0 : null,
    })
    return result
  }

  // Login with email/password
  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  // Google Sign In
  async function loginWithGoogle(role) {
    const result = await signInWithPopup(auth, googleProvider)
    // Check if user already exists in Firestore
    const userDoc = await getDoc(
      doc(db, 'users', result.user.uid)
    )
    // If new user, create their profile
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName,
        role: role || 'tourist',
        createdAt: new Date().toISOString(),
        certificateStatus: role === 'guide' ? 'pending' : null,
        walletUSD: role === 'tourist' ? 0 : null,
        walletINR: role === 'tourist' ? 0 : null,
      })
    }
    return result
  }

  // Logout
  async function logout() {
    await signOut(auth)
    setUserRole(null)
    setUserProfile(null)
  }

  // Fetch user profile from Firestore
  async function fetchUserProfile(uid) {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      const data = userDoc.data()
      setUserRole(data.role)
      setUserProfile(data)
      return data
    }
    return null
  }

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        await fetchUserProfile(user.uid)
      } else {
        setUserRole(null)
        setUserProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userRole,
    userProfile,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    fetchUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
