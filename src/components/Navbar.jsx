import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
    const navigate = useNavigate()
    const { profile, logout } = useAuth()

    async function handleLogout() {
        try {
            await logout()
            navigate('/login')
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <nav className="navbar">
            <div className="nav-brand">Influencer CRM</div>

            <div className="nav-links">
                {profile?.role === 'BRAND_MANAGER' && (
                    <>
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/influencers">Influencers</Link>
                        <Link to="/campaigns">Campaigns</Link>
                        <Link to="/pipeline">Pipeline</Link>
                    </>
                )}

                {profile?.role === 'ADMIN' && (
                    <>
                        <Link to="/admin">Admin Dashboard</Link>
                    </>
                )}

                {profile ? (
                    <>
                        <span className="role-pill">
                            {profile.role === 'ADMIN' ? 'Admin' : 'Brand Manager'}
                        </span>
                        <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <Link to="/login">Login</Link>
                )}
            </div>
        </nav>
    )
}

export default Navbar