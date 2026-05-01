import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser } from '../services/authService'

function Login() {
  const navigate = useNavigate()

  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('BRAND_MANAGER')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function redirectByRole(profile) {
    if (profile.role === 'ADMIN') {
      navigate('/admin')
    } else {
      navigate('/dashboard')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let profile

      if (mode === 'login') {
        profile = await loginUser({ email, password })
      } else {
        profile = await registerUser({ email, password, name, role })
      }

      redirectByRole(profile)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Influencer Outreach CRM</h1>
        <p className="muted">
          {mode === 'login'
            ? 'Log in to manage campaigns and influencer outreach.'
            : 'Create a new CRM user account.'}
        </p>

        <form onSubmit={handleSubmit} className="form">
          {mode === 'register' && (
            <>
              <label>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                required
              />
            </>
          )}

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />

          {mode === 'register' && (
            <>
              <label>User Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="BRAND_MANAGER">Brand Manager</option>
                <option value="ADMIN">System Admin</option>
              </select>
            </>
          )}

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading
              ? 'Please wait...'
              : mode === 'login'
                ? 'Log In'
                : 'Create Account'}
          </button>
        </form>

        <button
          className="link-button"
          onClick={() => {
            setError('')
            setMode(mode === 'login' ? 'register' : 'login')
          }}
        >
          {mode === 'login'
            ? 'Need an account? Register here.'
            : 'Already have an account? Log in.'}
        </button>
      </div>
    </div>
  )
}

export default Login