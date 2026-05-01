import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  getInfluencerById,
  updateInfluencer,
} from '../services/influencerService'

function EditInfluencer() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    platform: 'INSTAGRAM',
    handle: '',
    email: '',
    follower_count: '',
    niche: '',
    contact_details: '',
  })

  useEffect(() => {
    async function loadInfluencer() {
      try {
        setLoading(true)
        setError('')

        const influencer = await getInfluencerById(id)

        setForm({
          name: influencer.name || '',
          platform: influencer.platform || 'INSTAGRAM',
          handle: influencer.handle || '',
          email: influencer.email || '',
          follower_count: influencer.follower_count || '',
          niche: influencer.niche || '',
          contact_details: influencer.contact_details || '',
        })
      } catch (err) {
        console.error(err)
        setError(err.message || 'Could not load influencer.')
      } finally {
        setLoading(false)
      }
    }

    loadInfluencer()
  }, [id])

  function handleChange(e) {
    const { name, value } = e.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')

      await updateInfluencer(id, {
        ...form,
        follower_count: Number(form.follower_count),
      })

      navigate(`/influencers/${id}`)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not update influencer.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p>Loading influencer...</p>
  }

  return (
    <div>
      <div className="page-header">
        <Link to={`/influencers/${id}`} className="back-link">
          ← Back to Profile
        </Link>

        <h1>Edit Influencer</h1>
        <p className="muted">
          Update this influencer’s profile, contact information, and CRM details.
        </p>
      </div>

      <section className="card edit-page-card">
        <form onSubmit={handleSubmit} className="form">
          <label>Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Sophie Lane"
            required
          />

          <label>Platform</label>
          <select
            name="platform"
            value={form.platform}
            onChange={handleChange}
            required
          >
            <option value="INSTAGRAM">Instagram</option>
            <option value="YOUTUBE">YouTube</option>
            <option value="TIKTOK">TikTok</option>
            <option value="TWITTER">Twitter/X</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="OTHER">Other</option>
          </select>

          <label>Handle</label>
          <input
            name="handle"
            value={form.handle}
            onChange={handleChange}
            placeholder="@sophielane"
            required
          />

          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="sophie@example.com"
          />

          <label>Follower Count</label>
          <input
            name="follower_count"
            type="number"
            value={form.follower_count}
            onChange={handleChange}
            placeholder="85000"
            required
          />

          <label>Niche</label>
          <input
            name="niche"
            value={form.niche}
            onChange={handleChange}
            placeholder="Beauty, skincare, lifestyle"
          />

          <label>Contact Details</label>
          <textarea
            name="contact_details"
            value={form.contact_details}
            onChange={handleChange}
            placeholder="Prefers email outreach."
            rows="4"
          />

          {error && <p className="error">{error}</p>}

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            <Link to={`/influencers/${id}`} className="secondary-link-button">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  )
}

export default EditInfluencer