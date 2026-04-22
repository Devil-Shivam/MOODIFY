import axios from "axios"

const api = axios.create({
    baseURL: "https://moodify-tzs0.onrender.com",
    withCredentials: true
})

export async function register({ email, password, username }) {
    const response = await api.post("/api/auth/register", {
        email, password, username
    })

    return response.data
}

export async function login({ email, password }) {
    const response = await api.post("/api/auth/login", {
        email, password
    })

    return response.data
}

export async function getMe() {
    const response = await api.get("/api/auth/get-me")
    return response.data
}

export async function updateProfile(profile) {
    const response = await api.patch("/api/auth/profile", profile)
    return response.data
}

export async function getDashboard() {
    const response = await api.get("/api/auth/dashboard")
    return response.data
}

export async function logout() {
    const response = await api.get("/api/auth/logout")
    return response.data
}