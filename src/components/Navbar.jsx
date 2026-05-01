import { Link, useNavigate } from 'react-router-dom'
import { logoutUser } from '../services/authService'

function Navbar() {
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logoutUser()
      navigate('/login')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <nav className="navbar">
      <div className="nav-brand">Influencer CRM</div>

      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/influencers">Influencers</Link>
        <Link to="/campaigns">Campaigns</Link>
        <Link to="/pipeline">Pipeline</Link>
        <Link to="/admin">Admin</Link>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  )
}

export default Navbar