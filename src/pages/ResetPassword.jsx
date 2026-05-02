import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

function ResetPassword() {
    const navigate = useNavigate()

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()

        if (password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        try {
            setSaving(true)
            setError('')
            setSuccessMessage('')

            const { error } = await supabase.auth.updateUser({
                password,
            })

            if (error) throw error

            setSuccessMessage('Password updated successfully. You can now log in.')
            setPassword('')
            setConfirmPassword('')

            setTimeout(() => {
                navigate('/login')
            }, 1200)
        } catch (err) {
            console.error(err)
            setError(err.message || 'Could not update password.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Reset Password</h1>
                <p className="muted">
                    Enter a new password for your account.
                </p>

                <form onSubmit={handleSubmit} className="form">
                    <label>New Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="New password"
                        required
                    />

                    <label>Confirm Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        required
                    />

                    {error && <p className="error">{error}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}

                    <button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ResetPassword