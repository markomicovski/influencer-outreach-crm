import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getAdminDashboardData,
  updateUserActiveStatus,
  adminCreateUser,
  adminResetPassword,
} from '../services/adminService'
import { useAuth } from '../context/AuthContext'

function AdminDashboard() {
  const { profile } = useAuth()

  const [adminData, setAdminData] = useState({
    users: [],
    totals: {
      totalUsers: 0,
      brandManagers: 0,
      admins: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      totalInfluencers: 0,
      totalCampaigns: 0,
      totalOutreach: 0,
    },
  })

  const [loading, setLoading] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [passwordModalUser, setPasswordModalUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [resettingPassword, setResettingPassword] = useState(false)

  const [creatingUser, setCreatingUser] = useState(false)
  const [createUserForm, setCreateUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BRAND_MANAGER',
  })

  function handleCreateUserChange(e) {
    const { name, value } = e.target

    setCreateUserForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleDirectPasswordReset(e) {
    e.preventDefault()

    if (!passwordModalUser) return

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }

    try {
      setResettingPassword(true)
      setError('')
      setSuccessMessage('')

      await adminResetPassword({
        userId: passwordModalUser.id,
        password: newPassword,
      })

      setSuccessMessage(`Password reset for ${passwordModalUser.email}.`)
      setPasswordModalUser(null)
      setNewPassword('')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not reset password.')
    } finally {
      setResettingPassword(false)
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault()

    try {
      setCreatingUser(true)
      setError('')
      setSuccessMessage('')

      await adminCreateUser(createUserForm)

      setSuccessMessage(`User account created for ${createUserForm.email}.`)

      setCreateUserForm({
        name: '',
        email: '',
        password: '',
        role: 'BRAND_MANAGER',
      })

      await loadAdminDashboard()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not create user.')
    } finally {
      setCreatingUser(false)
    }
  }

  async function loadAdminDashboard() {
    try {
      setLoading(true)
      setError('')

      const data = await getAdminDashboardData()
      setAdminData(data)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not load admin dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminDashboard()
  }, [])

  async function handleToggleActive(user) {
    try {
      setUpdatingUserId(user.id)
      setError('')

      await updateUserActiveStatus(user.id, !user.is_active)
      await loadAdminDashboard()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not update user status.')
    } finally {
      setUpdatingUserId('')
    }
  }

  function formatDate(dateValue) {
    if (!dateValue) return '—'

    return new Date(dateValue).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }


  if (loading) {
    return (
      <div>
        <div className="page-header dashboard-header">
          <div>
            <div className="skeleton" style={{ width: 180, height: 32, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: 340, height: 13 }} />
          </div>
          <div className="dashboard-actions">
            <div className="skeleton" style={{ width: 130, height: 36, borderRadius: 10 }} />
            <div className="skeleton" style={{ width: 110, height: 36, borderRadius: 10 }} />
          </div>
        </div>
        <section className="stats-grid admin-stats-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card">
              <div className="skeleton" style={{ width: 110, height: 11, marginBottom: 10 }} />
              <div className="skeleton" style={{ width: 50, height: 30, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: 160, height: 11 }} />
            </div>
          ))}
        </section>
        <section className="stats-grid admin-stats-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card small-stat">
              <div className="skeleton" style={{ width: 90, height: 11, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: 40, height: 24 }} />
            </div>
          ))}
        </section>
        <section className="card">
          <div className="section-header" style={{ marginBottom: 16 }}>
            <div>
              <div className="skeleton" style={{ width: 130, height: 13, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: 200, height: 11 }} />
            </div>
            <div className="skeleton" style={{ width: 60, height: 22, borderRadius: 20 }} />
          </div>
          <div className="list-rows">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="list-card">
                <div className="list-card-info">
                  <div className="skeleton" style={{ width: 130, height: 13, marginBottom: 6 }} />
                  <div className="list-card-meta">
                    <div className="skeleton" style={{ width: 160, height: 11 }} />
                    <div className="skeleton" style={{ width: 80, height: 18, borderRadius: 20 }} />
                    <div className="skeleton" style={{ width: 50, height: 18, borderRadius: 20 }} />
                    <div className="skeleton" style={{ width: 80, height: 11 }} />
                  </div>
                </div>
                <div className="list-card-actions">
                  <div className="skeleton" style={{ width: 110, height: 30, borderRadius: 10 }} />
                  <div className="skeleton" style={{ width: 90, height: 30, borderRadius: 20 }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    )
  }

  return (
    <div>
      {passwordModalUser && (
        <div
          className="modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget && setPasswordModalUser(null)
          }
        >
          <div className="modal">
            <div className="modal-header">
              <h2>Reset Password</h2>
              <button
                className="modal-close"
                onClick={() => setPasswordModalUser(null)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <p className="muted">
              Set a new temporary password for {passwordModalUser.email}.
            </p>

            <form onSubmit={handleDirectPasswordReset} className="form">
              <label>New Temporary Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New temporary password"
                required
              />

              <button type="submit" disabled={resettingPassword}>
                {resettingPassword ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>
        </div>
      )}
      <div className="page-header dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="muted">
            Welcome{profile?.name ? `, ${profile.name}` : ''}. Manage system
            users and review platform-wide CRM activity.
          </p>
        </div>

        <div className="dashboard-actions">

          <button
            type="button"
            className="secondary-action-button"
            onClick={loadAdminDashboard}
          >
            Refresh Data
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <section className="stats-grid admin-stats-grid">
        <div className="stat-card">
          <span>Total Users</span>
          <strong>{adminData.totals.totalUsers}</strong>
          <p>All user profiles currently stored in the system</p>
        </div>

        <div className="stat-card">
          <span>Brand Managers</span>
          <strong>{adminData.totals.brandManagers}</strong>
          <p>Users with access to CRM campaign workflows</p>
        </div>

        <div className="stat-card">
          <span>Admins</span>
          <strong>{adminData.totals.admins}</strong>
          <p>Users with system management privileges</p>
        </div>

        <div className="stat-card">
          <span>Active Users</span>
          <strong>{adminData.totals.activeUsers}</strong>
          <p>Accounts currently allowed to access the CRM</p>
        </div>
      </section>

      <section className="stats-grid admin-stats-grid">
        <div className="stat-card small-stat">
          <span>Inactive Users</span>
          <strong>{adminData.totals.inactiveUsers}</strong>
        </div>

        <div className="stat-card small-stat">
          <span>Influencers</span>
          <strong>{adminData.totals.totalInfluencers}</strong>
        </div>

        <div className="stat-card small-stat">
          <span>Campaigns</span>
          <strong>{adminData.totals.totalCampaigns}</strong>
        </div>

        <div className="stat-card small-stat">
          <span>Outreach Records</span>
          <strong>{adminData.totals.totalOutreach}</strong>
        </div>
      </section>

      <section className="card admin-create-user-card">
        <div className="section-header">
          <div>
            <h2>Create User</h2>
            <p className="muted">
              Create a new CRM account with a temporary password.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateUser} className="admin-create-user-form">
          <div>
            <label>Name</label>
            <input
              name="name"
              value={createUserForm.name}
              onChange={handleCreateUserChange}
              placeholder="Jordan Smith"
              required
            />
          </div>

          <div>
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={createUserForm.email}
              onChange={handleCreateUserChange}
              placeholder="jordan@example.com"
              required
            />
          </div>

          <div>
            <label>Temporary Password</label>
            <input
              name="password"
              type="password"
              value={createUserForm.password}
              onChange={handleCreateUserChange}
              placeholder="Temporary password"
              required
            />
          </div>

          <div>
            <label>Role</label>
            <select
              name="role"
              value={createUserForm.role}
              onChange={handleCreateUserChange}
            >
              <option value="BRAND_MANAGER">Brand Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button type="submit" disabled={creatingUser}>
            {creatingUser ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </section>

      <section className="card">
        <div className="section-header">
          <div>
            <h2>User Management</h2>
            <p className="muted">
              Review registered users, roles, and account status.
            </p>
          </div>

          <span className="status-pill">
            {adminData.users.length} users
          </span>
        </div>

        {adminData.users.length === 0 ? (
          <p className="muted">No users have been registered yet.</p>
        ) : (
          <div className="list-rows">
            {adminData.users.map((user) => (
              <div key={user.id} className="list-card">
                <div className="list-card-info">
                  <span className="list-card-title">{user.name || '—'}</span>
                  <div className="list-card-meta">
                    <span>{user.email}</span>
                    <span className="role-badge">
                      {user.role === 'ADMIN' ? 'Admin' : 'Brand Manager'}
                    </span>
                    <span className={user.is_active ? 'active-status-badge' : 'inactive-status-badge'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span>{formatDate(user.created_at)}</span>
                  </div>
                </div>
                <div className="list-card-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setError('')
                      setSuccessMessage('')
                      setNewPassword('')
                      setPasswordModalUser(user)
                    }}
                  >
                    Reset Password
                  </button>
                  <button
                    type="button"
                    className={user.is_active ? 'danger-button' : 'secondary-button'}
                    onClick={() => handleToggleActive(user)}
                    disabled={updatingUserId === user.id}
                  >
                    {updatingUserId === user.id
                      ? 'Updating...'
                      : user.is_active ? 'Deactivate' : 'Reactivate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card admin-note-card">
        <h2>System Settings</h2>
        <p className="muted">
          Pipeline stages are currently configured as Contacted, Replied,
          Shipped, and Posted. These stages support the outreach workflow used
          by Brand Managers.
        </p>

        <div className="pipeline-stage-preview">
          <span className="status-pill status-pill--contacted">CONTACTED</span>
          <span className="status-pill status-pill--replied">REPLIED</span>
          <span className="status-pill status-pill--shipped">SHIPPED</span>
          <span className="status-pill status-pill--posted">POSTED</span>
        </div>
      </section>
    </div>
  )
}

export default AdminDashboard