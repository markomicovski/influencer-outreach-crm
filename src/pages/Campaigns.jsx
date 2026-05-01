import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    createCampaign,
    deleteCampaign,
    getCampaigns,
    updateCampaignStatus,
} from '../services/campaignService'

function Campaigns() {
    const [campaigns, setCampaigns] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')

    const [form, setForm] = useState({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'DRAFT',
    })

    async function loadCampaigns() {
        try {
            setLoading(true)
            setError('')
            const data = await getCampaigns()
            setCampaigns(data)
        } catch (err) {
            console.error(err)
            setError(err.message || 'Could not load campaigns.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCampaigns()
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

            await createCampaign(form)

            setForm({
                name: '',
                description: '',
                start_date: '',
                end_date: '',
                status: 'DRAFT',
            })

            await loadCampaigns()
        } catch (err) {
            console.error(err)
            setError(err.message || 'Could not create campaign.')
        } finally {
            setSaving(false)
        }
    }

    async function handleStatusChange(id, status) {
        try {
            setError('')
            await updateCampaignStatus(id, status)
            await loadCampaigns()
        } catch (err) {
            console.error(err)
            setError(err.message || 'Could not update campaign status.')
        }
    }

    async function handleDelete(id) {
        try {
            setError('')
            await deleteCampaign(id)
            await loadCampaigns()
        } catch (err) {
            console.error(err)
            setError(err.message || 'Could not delete campaign.')
        }
    }

    const filteredCampaigns = campaigns.filter((campaign) => {
        const search = searchTerm.toLowerCase()

        const matchesSearch =
            campaign.name?.toLowerCase().includes(search) ||
            campaign.description?.toLowerCase().includes(search)

        const matchesStatus =
            statusFilter === 'ALL' || campaign.status === statusFilter

        return matchesSearch && matchesStatus
    })

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Campaign Management</h1>
                    <p className="muted">
                        Create and manage outreach campaigns for influencer collaborations.
                    </p>
                </div>
            </div>

            <div className="grid-two">
                <section className="card">
                    <h2>Create Campaign</h2>

                    <form onSubmit={handleSubmit} className="form">
                        <label>Campaign Name</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Spring Skincare Launch"
                            required
                        />

                        <label>Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Campaign for promoting the spring skincare product line."
                            rows="3"
                        />

                        <label>Start Date</label>
                        <input
                            name="start_date"
                            type="date"
                            value={form.start_date}
                            onChange={handleChange}
                        />

                        <label>End Date</label>
                        <input
                            name="end_date"
                            type="date"
                            value={form.end_date}
                            onChange={handleChange}
                        />

                        <label>Status</label>
                        <select name="status" value={form.status} onChange={handleChange}>
                            <option value="DRAFT">Draft</option>
                            <option value="ACTIVE">Active</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>

                        {error && <p className="error">{error}</p>}

                        <button type="submit" disabled={saving}>
                            {saving ? 'Saving...' : 'Create Campaign'}
                        </button>
                    </form>
                </section>

                <section className="card">
                    <h2>Campaign List</h2>
                    <div className="filter-row">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by campaign name or description..."
                        />

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="DRAFT">Draft</option>
                            <option value="ACTIVE">Active</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>
                    </div>

                    {loading ? (
                        <p>Loading campaigns...</p>
                    ) : campaigns.length === 0 ? (
                        <p className="muted">No campaigns have been created yet.</p>
                    ) : filteredCampaigns.length === 0 ? (
                        <p className="muted">No campaigns match your current search or filter.</p>
                    ) : (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Status</th>
                                        <th>Start</th>
                                        <th>End</th>
                                        <th>Description</th>
                                        <th>Update</th>
                                        <th></th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredCampaigns.map((campaign) => (
                                        <tr key={campaign.id}>
                                            <td>
                                                <Link to={`/campaigns/${campaign.id}`} className="table-link">
                                                    {campaign.name}
                                                </Link>
                                            </td>
                                            <td>
                                                <span className="status-pill">{campaign.status}</span>
                                            </td>
                                            <td>{campaign.start_date || '—'}</td>
                                            <td>{campaign.end_date || '—'}</td>
                                            <td>{campaign.description || '—'}</td>
                                            <td>
                                                <select
                                                    value={campaign.status}
                                                    onChange={(e) =>
                                                        handleStatusChange(campaign.id, e.target.value)
                                                    }
                                                >
                                                    <option value="DRAFT">Draft</option>
                                                    <option value="ACTIVE">Active</option>
                                                    <option value="COMPLETED">Completed</option>
                                                    <option value="ARCHIVED">Archived</option>
                                                </select>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <Link
                                                        to={`/campaigns/${campaign.id}/edit`}
                                                        className="secondary-link-button compact-link-button"
                                                    >
                                                        Edit
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        className="danger-button"
                                                        onClick={() => handleDelete(campaign.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
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

export default Campaigns