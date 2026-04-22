import React, { useContext, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../auth.context"
import { useAuth } from "../hooks/useAuth"
import { useSong } from "../../home/hooks/useSong"
import Player from "../../home/components/Player"
import { getFavorites, toggleFavorite } from "../../home/service/song.api"
import "../style/favorites.scss"

const Favorites = () => {
    const { user } = useContext(AuthContext)
    const { handleLogout } = useAuth()
    const { song, setSong } = useSong()
    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState(true)
    const [removing, setRemoving] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchFavorites() {
            setLoading(true)
            try {
                const data = await getFavorites()
                setFavorites(data.favorites || [])
            } catch (error) {
                console.error("Failed to load favorites", error)
            } finally {
                setLoading(false)
            }
        }

        fetchFavorites()
    }, [song])

    const handlePlay = (item) => {
        setSong(item)
    }

    const handleRemove = async (id) => {
        setRemoving(id)
        try {
            await toggleFavorite(id)
            setFavorites((current) => current.filter((song) => song._id !== id && song.id !== id))
            if (song?._id === id || song?.id === id) {
                setSong(null)
            }
        } catch (error) {
            console.error("Remove favorite failed", error)
        } finally {
            setRemoving(null)
        }
    }

    return (
        <main className="favorites-page">
            <div className="favorites__topbar">
                <div>
                    <h1>Your favorites</h1>
                    <p>Quick access to songs you loved and a built-in player to listen instantly.</p>
                </div>
                <div className="favorites__topbar-actions">
                    <Link to="/" className="button button--ghost">Home</Link>
                    <button className="button button--ghost" onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button className="button" onClick={async () => { await handleLogout(); navigate('/login') }}>Logout</button>
                </div>
            </div>

            <section className="favorites__content">
                <div className="favorites__list-card">
                    <h2>Favorite songs</h2>
                    {loading ? (
                        <p className="favorites__empty">Loading favorites…</p>
                    ) : favorites.length ? (
                        <ul className="favorites__list">
                            {favorites.map((item) => (
                                <li key={item._id || item.id} className="favorites__item">
                                    <div className="favorites__item-meta">
                                        <img src={item.posterUrl} alt={item.title} />
                                        <div>
                                            <strong>{item.title}</strong>
                                            <span>{item.mood}</span>
                                        </div>
                                    </div>
                                    <div className="favorites__item-actions">
                                        <button className="button button--ghost" onClick={() => handlePlay(item)}>Play</button>
                                        <button className="button" disabled={removing === (item._id || item.id)} onClick={() => handleRemove(item._id || item.id)}>
                                            {removing === (item._id || item.id) ? "Removing..." : "Remove"}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="favorites__empty">You have not added any favorite songs yet.</p>
                    )}
                </div>

                <div className="favorites__player-card">
                    {song ? <Player /> : <div className="favorites__empty-player">Select any favorite song to start listening.</div>}
                </div>
            </section>
        </main>
    )
}

export default Favorites
