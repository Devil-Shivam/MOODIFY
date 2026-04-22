import axios from "axios";


const api = axios.create({
    baseURL: "https://moodify-tzs0.onrender.com",
    withCredentials: true
})


export async function getSong({ mood }) {
    const response = await api.get("/api/songs/play?mood=" + mood)
    return response.data
}

export async function toggleFavorite(songId) {
    const response = await api.post("/api/songs/favorite", { songId })
    return response.data
}

export async function getFavorites() {
    const response = await api.get("/api/songs/favorites")
    return response.data
}