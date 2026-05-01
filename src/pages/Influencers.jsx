import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    createInfluencer,
    deleteInfluencer,
    getInfluencers,
} from '../services/influencerService'

function Influencers() {
    const [influencers, setInfluencers] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [modalOpen, setModalOpen] = useState(false)

    const [searchTerm, setSearchTerm] = useState('')
    const [platformFilter, setPlatformFilter] = useState('ALL')

    const [form, setForm] = useState({
        name: '',
        platform: 'INSTAGRAM',
        handle: '',
        email: '',
        follower_count: '',
        niche: '',
        contact_details: '',
    })

    async function loadInfluencers() {
        try {
            setLoading(true)
            setError('')
            const data = await getInfluencers()
            setInfluencers(data)
        } catch (err) {
            console.error(err)
            setError(err.message || 'Could not load influencers.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadInfluencers()
    }, [])

    useEffect(() => {
        if (!modalOpen) return
        function onKey(e) {
            if (e.key === 'Escape') closeModal()
        }
        document.addEventListener('keydown', onKey)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = ''
        }
    }, [modalOpen])

    function openModal() {
        setError('')
        setModalOpen(true)
    }

    function closeModal() {
        setModalOpen(false)
        setError('')
    }

    function handleChange(e) {
        const { name, value } = e.target
        setForm((current) => ({ ...current, [name]: value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            setSaving(true)
            setError('')
            await createInfluencer({
                ...form,
                follower_count: Number(form.follower_count),
            })
            setForm({
                name: '',
                platform: 'INSTAGRAM',
                handle: '',
                email: '',
                follower_count: '',
                niche: '',
                contact_details: '',
            })
            closeModal()
            await loadInfluencers()
        } catch (err) {
            console.error(err)
            setError(err.message || 'Could not save influencer.')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(id) {
        const confirmed = window.confirm('Are you sure you want to delete this influencer?')
        if (!confirmed) return
        try {
            setError('')
            await deleteInfluencer(id)
            await loadInfluencers()
        } catch (err) {
            console.error(err)
            setError(err.message || 'Could not delete influencer.')
        }
    }

    const filteredInfluencers = influencers.filter((influencer) => {
        const search = searchTerm.toLowerCase()
        const matchesSearch =
            influencer.name?.toLowerCase().includes(search) ||
            influencer.handle?.toLowerCase().includes(search) ||
            influencer.niche?.toLowerCase().includes(search) ||
            influencer.email?.toLowerCase().includes(search)
        const matchesPlatform =
            platformFilter === 'ALL' || influencer.platform === platformFilter
        return matchesSearch && matchesPlatform
    })

    return (
        <div>
            {modalOpen && (
                <div
                    className="modal-overlay"
                    onClick={(e) => e.target === e.currentTarget && closeModal()}
                >
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Add Influencer</h2>
                            <button className="modal-close" onClick={closeModal} aria-label="Close">
                                &times;
                            </button>
                        </div>

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
                                rows="3"
                            />

                            {error && <p className="error">{error}</p>}

                            <button type="submit" disabled={saving}>
                                {saving ? 'Saving...' : 'Add Influencer'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="page-header dashboard-header">
                <div>
                    <h1>Influencer Management</h1>
                    <p className="muted">
                        Add, view, search, and manage influencer profiles for outreach campaigns.
                    </p>
                </div>
                <button className="primary-button" onClick={openModal}>
                    Add Influencer
                </button>
            </div>

            {error && !modalOpen && <p className="error" style={{ marginBottom: 16 }}>{error}</p>}

            <section className="card">
                <div className="section-header">
                    <div>
                        <h2>All Influencers</h2>
                        <p className="muted">
                            {influencers.length} total influencer{influencers.length === 1 ? '' : 's'} in the CRM.
                        </p>
                    </div>
                </div>

                <div className="filter-row">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, handle, niche, or email..."
                    />
                    <select
                        value={platformFilter}
                        onChange={(e) => setPlatformFilter(e.target.value)}
                    >
                        <option value="ALL">All Platforms</option>
                        <option value="INSTAGRAM">Instagram</option>
                        <option value="YOUTUBE">YouTube</option>
                        <option value="TIKTOK">TikTok</option>
                        <option value="TWITTER">Twitter/X</option>
                        <option value="LINKEDIN">LinkedIn</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>

                {loading ? (
                    <p className="muted">Loading influencers...</p>
                ) : influencers.length === 0 ? (
                    <p className="muted">
                        No influencers yet. Click <strong>Add Influencer</strong> to get started.
                    </p>
                ) : filteredInfluencers.length === 0 ? (
                    <p className="muted">No influencers match your current search or filter.</p>
                ) : (
                    <div className="list-rows">
                        {filteredInfluencers.map((influencer) => (
                            <div key={influencer.id} className="list-card">
                                <div className="list-card-info">
                                    <Link
                                        to={`/influencers/${influencer.id}`}
                                        className="list-card-title"
                                    >
                                        {influencer.name}
                                    </Link>
                                    <div className="list-card-meta">
                                        <span
                                            className={`platform-badge ${influencer.platform?.toLowerCase()}`}
                                        >
                                            {influencer.platform}
                                        </span>
                                        {influencer.handle && <span>{influencer.handle}</span>}
                                        {influencer.follower_count > 0 && (
                                            <span>{influencer.follower_count.toLocaleString()} followers</span>
                                        )}
                                        {influencer.niche && <span>{influencer.niche}</span>}
                                    </div>
                                </div>
                                <div className="list-card-actions">
                                    <Link
                                        to={`/influencers/${influencer.id}/edit`}
                                        className="secondary-link-button compact-link-button"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        type="button"
                                        className="danger-button"
                                        onClick={() => handleDelete(influencer.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

export default Influencers
