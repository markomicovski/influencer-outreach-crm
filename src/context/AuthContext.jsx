import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { getCurrentProfile, logoutUser } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    async function loadProfile() {
        try {
            setLoading(true)
            const currentProfile = await getCurrentProfile()
            setProfile(currentProfile)
        } catch (err) {
            console.error('Error loading profile:', err)
            setProfile(null)
        } finally {
            setLoading(false)
        }
    }

    async function logout() {
        await logoutUser()
        setProfile(null)
    }

    useEffect(() => {
        loadProfile()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(() => {
            loadProfile()
        })

        return () => subscription.unsubscribe()
    }, [])

    return (
        <AuthContext.Provider
            value={{
                profile,
                setProfile,
                loading,
                refreshProfile: loadProfile,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used inside an AuthProvider')
    }

    return context
}