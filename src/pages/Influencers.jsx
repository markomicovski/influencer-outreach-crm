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

            await loadInfluencers()
        } catch (err) {
            console.error(err)
            setError(err.message || 'Could not create influencer.')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(id) {
        try {
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
            <div className="page-header">
                <div>
                    <h1>Influencer Management</h1>
                    <p className="muted">
                        Add, view, and manage influencer profiles for outreach campaigns.
                    </p>
                </div>
            </div>

            <div className="grid-two">
                <section className="card">
                    <h2>Add Influencer</h2>

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
                </section>

                <section className="card">
                    <h2>Influencer List</h2>
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
                        <p>Loading influencers...</p>
                    ) : influencers.length === 0 ? (
                        <p className="muted">No influencers have been added yet.</p>
                    ) : filteredInfluencers.length === 0 ? (
                        <p className="muted">No influencers match your current search or filter.</p>
                    ) : (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Platform</th>
                                        <th>Handle</th>
                                        <th>Followers</th>
                                        <th>Niche</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInfluencers.map((influencer) => (
                                        <tr key={influencer.id}>
                                            <td>
                                                <Link to={`/influencers/${influencer.id}`} className="table-link">
                                                    {influencer.name}
                                                </Link>
                                            </td>
                                            <td>
                                                <span className={`platform-badge ${influencer.platform.toLowerCase()}`}>
                                                    {influencer.platform}
                                                </span>
                                            </td>
                                            <td>{influencer.handle}</td>
                                            <td>{influencer.follower_count?.toLocaleString()}</td>
                                            <td>{influencer.niche}</td>
                                            <td>
                                                <button
                                                    className="danger-button"
                                                    onClick={() => handleDelete(influencer.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

export default Influencers