import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

function InfluencerProfile() {
  const { id } = useParams()
  const [influencer, setInfluencer] = useState(null)
  const [outreachRecords, setOutreachRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadInfluencerProfile() {
      try {
        setLoading(true)
        setError('')

        const { data: influencerData, error: influencerError } = await supabase
          .from('influencers')
          .select('*')
          .eq('id', id)
          .single()

        if (influencerError) throw influencerError

        const { data: outreachData, error: outreachError } = await supabase
          .from('outreach')
          .select(`
            *,
            campaigns (*),
            notes (*)
          `)
          .eq('influencer_id', id)
          .order('created_at', { ascending: false })

        if (outreachError) throw outreachError

        setInfluencer(influencerData)
        setOutreachRecords(outreachData || [])
      } catch (err) {
        console.error(err)
        setError(err.message || 'Could not load influencer profile.')
      } finally {
        setLoading(false)
      }
    }

    loadInfluencerProfile()
  }, [id])

  if (loading) return <p>Loading influencer profile...</p>
  if (error) return <p className="error">{error}</p>
  if (!influencer) return <p>Influencer not found.</p>

  return (
    <div>
      <div className="page-header">
        <Link to="/influencers" className="back-link">
          ← Back to Influencers
        </Link>

        <h1>{influencer.name}</h1>
        <p className="muted">
          {influencer.platform} influencer profile and outreach history.
        </p>
      </div>

      <div className="profile-grid">
        <section className="card">
          <h2>Profile Details</h2>

          <div className="detail-list">
            <div>
              <span>Name</span>
              <strong>{influencer.name}</strong>
            </div>

            <div>
              <span>Platform</span>
              <strong>
                <span className={`platform-badge ${influencer.platform?.toLowerCase()}`}>
                  {influencer.platform}
                </span>
              </strong>
            </div>

            <div>
              <span>Handle</span>
              <strong>{influencer.handle}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{influencer.email || '—'}</strong>
            </div>

            <div>
              <span>Followers</span>
              <strong>{influencer.follower_count?.toLocaleString() || '—'}</strong>
            </div>

            <div>
              <span>Niche</span>
              <strong>{influencer.niche || '—'}</strong>
            </div>

            <div>
              <span>Contact Details</span>
              <strong>{influencer.contact_details || '—'}</strong>
            </div>
          </div>
        </section>

        <section className="card">
          <h2>Outreach History</h2>

          {outreachRecords.length === 0 ? (
            <p className="muted">
              This influencer has not been assigned to any campaigns yet.
            </p>
          ) : (
            <div className="history-list">
              {outreachRecords.map((record) => (
                <div key={record.id} className="history-item">
                  <div>
                    <strong>{record.campaigns?.name || 'Campaign'}</strong>
                    <p className="muted">
                      Status: <span className="status-pill">{record.status}</span>
                    </p>
                  </div>

                  {record.notes?.length > 0 && (
                    <ul>
                      {record.notes.map((note) => (
                        <li key={note.id}>{note.content}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default InfluencerProfile