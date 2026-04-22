import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FaceExpression from '../../Expression/components/FaceExpression'
import Player from '../components/Player'
import { useSong } from '../hooks/useSong'
import { AuthContext } from '../../auth/auth.context'
import { useAuth } from '../../auth/hooks/useAuth'
import '../style/home.scss'

const Home = () => {

    const { handleGetSong } = useSong()
    const { user } = useContext(AuthContext)
    const { handleLogout } = useAuth()
    const navigate = useNavigate()
    const [ status, setStatus ] = useState('Use face detection to discover your mood. Login to play the curated track.')

    const logout = async () => {
        await handleLogout()
        navigate('/login')
    }

    const handleExpression = async (expression) => {
        if (!expression) {
            setStatus('Face not detected. Please try again.')
            return
        }

        if (!user) {
            setStatus(`Detected mood: ${expression}. Login to listen to the matching track.`)
            return
        }

        try {
            setStatus(`Detected mood: ${expression}. Fetching your song...`)
            await handleGetSong({ mood: expression })
            setStatus(`Live mood detected: ${expression}. Song updated.`)
        } catch (error) {
            console.error(error)
            setStatus(`Detected mood: ${expression}. Could not load a song right now.`)
        }
    }

    return (
        <main className="home-page">
            <section className="home-page__hero">
                <div className="home-page__intro">
                    <span className="home-page__eyebrow">Moodify</span>
                    <h1>Face-detect your mood and play the perfect song.</h1>
                    <p>See your expression, identify your mood, and unlock music only after login. The experience is smooth, modern, and designed for a premium feel.</p>

                    {user ? (
                        <div className="home-page__cta home-page__cta--user">
                            <button className="button button--ghost" onClick={() => navigate('/dashboard')}>Dashboard</button>
                            <button className="button button--ghost" onClick={() => navigate('/favorites')}>Favorites</button>
                            <button className="button" onClick={logout}>Logout</button>
                        </div>
                    ) : (
                        <div className="home-page__cta">
                            <Link to="/login" className="button">Login to play</Link>
                            <Link to="/register" className="button button--ghost">Create account</Link>
                        </div>
                    )}
                </div>

                <div className="home-page__status-card">
                    <div className="home-page__status-head">
                        <span>Expression detection</span>
                        <span className="home-page__status-badge">{user ? 'Logged in' : 'Guest mode'}</span>
                    </div>
                    <div className="home-page__status-text">{status}</div>
                    {user && <div className="home-page__live-badge">Live mood detection enabled</div>}
                </div>
            </section>

            <section className="home-page__grid">
                <div className="home-page__card">
                    <FaceExpression onClick={handleExpression} />
                </div>

                <div className="home-page__card home-page__card--player">
                    <div className="home-page__player-note">
                        {user ? 'Click detect once, then your mood changes will automatically update the song.' : 'Login to unlock the mood player and hear a song that matches your expression.'}
                    </div>
                    {user ? <Player /> : <div className="home-page__login-note">Login and allow camera access to auto-change songs when your expression changes.</div>}
                </div>
            </section>
        </main>
    )
}

export default Home