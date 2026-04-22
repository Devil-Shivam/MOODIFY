import React, { useState } from 'react'
import "../style/register.scss"
import FormGroup from '../components/FormGroup'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Register = () => {

    const [ username, setUsername ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")

    const navigate = useNavigate()

    const { loading, handleRegister } = useAuth()

    async function handleSubmit(e) {
        e.preventDefault()

        await handleRegister({ username, password, email })

        navigate('/')

    }

    return (
        <main className="register-page">
            <div className="form-container">
                <h1>Register</h1>
                <form onSubmit={handleSubmit} >
                    <FormGroup
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        label="Username"
                        placeholder="Enter your username" />
                    <FormGroup
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        label="Email"
                        placeholder="Enter your email" />
                    <FormGroup
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        label="Password"
                        type="password"
                        placeholder="Enter your password" />
                    <button className='button' type="submit">Register</button>
                </form>
                <p>Already have an account? <Link to="/login">Login here</Link></p>
            </div>
        </main>
    )
}

export default Register


