import { login, register, getMe, logout, updateProfile } from "../services/auth.api";
import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { SongContext } from "../../home/song.context";


export const useAuth = () => {
    const context = useContext(AuthContext)
    const songContext = useContext(SongContext)
    const { user, setUser, loading, setLoading } = context
    const { setSong } = songContext

    async function handleRegister({ username, email, password }) {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
            setSong(null)
        } catch (error) {
            console.error("Register failed", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    async function handleLogin({ username, email, password }) {
        setLoading(true)
        try {
            const data = await login({ username, email, password })
            setUser(data.user)
            setSong(null)
        } catch (error) {
            console.error("Login failed", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    async function handleGetMe() {
        setLoading(true)
        try {
            const data = await getMe()
            setUser(data.user)
        } catch (error) {
            console.warn("getMe failed", error)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    async function handleLogout() {
        setLoading(true)
        try {
            await logout()
            setUser(null)
            setSong(null)
        } catch (error) {
            console.error("Logout failed", error)
        } finally {
            setLoading(false)
        }
    }

    async function handleUpdateProfile(profile) {
        setLoading(true)
        try {
            const data = await updateProfile(profile)
            setUser(data.user)
            return data
        } catch (error) {
            console.error("Profile update failed", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    return ({
        user, loading, handleRegister, handleLogin, handleLogout, handleGetMe, handleUpdateProfile
    })
}