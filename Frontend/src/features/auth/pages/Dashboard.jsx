import React, { useContext, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../auth.context"
import { useAuth } from "../hooks/useAuth"
import { getDashboard } from "../services/auth.api"
import "../style/dashboard.scss"

const Dashboard = () => {
    const { user } = useContext(AuthContext)
    const { handleLogout, handleUpdateProfile } = useAuth()
    const [dashboard, setDashboard] = useState(null)
    const [profile, setProfile] = useState({
        name: user?.name || "",
        avatarUrl: user?.avatarUrl || ""
    })
    const [avatarFile, setAvatarFile] = useState(null)
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchDashboard() {
            setLoading(true)
            try {
                const data = await getDashboard()
                setDashboard(data.dashboard)
                setProfile({
                    name: data.dashboard.user.name || "",
                    avatarUrl: data.dashboard.user.avatarUrl || ""
                })
            } catch (error) {
                console.error("Unable to load dashboard", error)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboard()
    }, [])

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSaving(true)
        try {
            const payload = new FormData()
            payload.append("name", profile.name)
            if (avatarFile) {
                payload.append("avatar", avatarFile)
            } else if (profile.avatarUrl) {
                payload.append("avatarUrl", profile.avatarUrl)
            }
            await handleUpdateProfile(payload)
            const data = await getDashboard()
            setDashboard(data.dashboard)
        } catch (error) {
            console.error("Profile update failed", error)
        } finally {
            setSaving(false)
        }
    }

    const renderChart = () => {
        if (!dashboard?.chart?.length) return null

        return (
            <div className="dashboard__chart">
                {dashboard.chart.map((day) => (
                    <div key={day.date} className="dashboard__chart-day">
                        <span className="dashboard__chart-label">{day.label}</span>
                        <div className="dashboard__chart-bars">
                            <div className="dashboard__chart-bar dashboard__chart-bar--happy" style={{ height: `${Math.min(day.happy * 18, 180)}px` }} title={`Happy ${day.happy}`} />
                            <div className="dashboard__chart-bar dashboard__chart-bar--sad" style={{ height: `${Math.min(day.sad * 18, 180)}px` }} title={`Sad ${day.sad}`} />
                            <div className="dashboard__chart-bar dashboard__chart-bar--surprised" style={{ height: `${Math.min(day.surprised * 18, 180)}px` }} title={`Surprised ${day.surprised}`} />
                        </div>
                    </div>
                ))}
                <div className="dashboard__chart-legend">
                    <span><span className="legend-dot legend-dot--happy"/> Happy</span>
                    <span><span className="legend-dot legend-dot--sad"/> Sad</span>
                    <span><span className="legend-dot legend-dot--surprised"/> Surprised</span>
                </div>
            </div>
        )
    }

    if (loading) {
        return <main className="dashboard-page"><div className="dashboard__loading">Loading your mood dashboard...</div></main>
    }

    if (!dashboard) {
        return <main className="dashboard-page"><div className="dashboard__loading">Unable to load dashboard data. Please refresh.</div></main>
    }

    return (
        <main className="dashboard-page">
            <div className="dashboard__topbar">
                <div>
                    <h1>Welcome back, {user?.name || user?.username}</h1>
                    <p>Here is your mood history, favorite songs, and profile settings.</p>
                </div>
                <div className="dashboard__topbar-actions">
                    <Link to="/" className="button button--ghost">Home</Link>
                    <button className="button button--ghost" onClick={() => navigate('/favorites')}>Favorites</button>
                    <button className="button" onClick={async () => { await handleLogout(); navigate('/login') }}>Logout</button>
                </div>
            </div>

            <section className="dashboard__grid">
                <div className="dashboard__card dashboard__profile-card">
                    <div className="dashboard__profile-head">
                        <img className="dashboard__avatar" src={profile.avatarUrl || "https://via.placeholder.com/96?text=IMG"} alt="Profile" />
                        <div>
                            <p className="dashboard__label">Logged in as</p>
                            <h2>{user?.username}</h2>
                            <p>{user?.email}</p>
                        </div>
                    </div>
                    <form className="dashboard__form" onSubmit={handleSubmit}>
                        <label>
                            Name
                            <input
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                placeholder="Your display name"
                            />
                        </label>
                        <label>
                            Avatar image
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        setAvatarFile(file)
                                        setProfile({ ...profile, avatarUrl: URL.createObjectURL(file) })
                                    }
                                }}
                            />
                        </label>
                        <button className="button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
                    </form>
                </div>

                <div className="dashboard__card dashboard__stats-card">
                    <div className="dashboard__summary">
                        <div>
                            <span>Total moods tracked</span>
                            <strong>{dashboard?.history?.length || 0}</strong>
                        </div>
                        <div>
                            <span>Happy moments</span>
                            <strong>{dashboard?.moodCounts?.happy || 0}</strong>
                        </div>
                        <div>
                            <span>Sad moments</span>
                            <strong>{dashboard?.moodCounts?.sad || 0}</strong>
                        </div>
                        <div>
                            <span>Surprised moments</span>
                            <strong>{dashboard?.moodCounts?.surprised || 0}</strong>
                        </div>
                    </div>
                    <div className="dashboard__chart-card">
                        <h2>Last 7 days mood graph</h2>
                        {renderChart()}
                    </div>
                </div>

                <div className="dashboard__card dashboard__favorites-card">
                    <div className="dashboard__section-head">
                        <h2>Favorite songs</h2>
                        <span>{dashboard.favorites?.length || 0} saved</span>
                    </div>
                    {dashboard?.favorites?.length ? (
                        <ul className="dashboard__favorites-list">
                            {dashboard.favorites.map((song) => (
                                <li key={song._id || song.id}>{song.title}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="dashboard__empty">Your favorite songs will appear here after you tap the heart in the player.</p>
                    )}
                </div>
            </section>
        </main>
    )
}

export default Dashboard
