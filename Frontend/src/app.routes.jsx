import { createBrowserRouter } from "react-router-dom"
import Register from "./features/auth/pages/Register"
import Login from "./features/auth/pages/Login"
import Home from "./features/home/pages/Home"
import Dashboard from "./features/auth/pages/Dashboard"
import Favorites from "./features/auth/pages/Favorites"

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/dashboard",
        element: <Dashboard />
    },
    {
        path: "/favorites",
        element: <Favorites />
    }
])