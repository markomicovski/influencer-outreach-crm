import { supabase } from './supabaseClient'

export async function getInfluencers() {
  const { data, error } = await supabase
    .from('influencers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createInfluencer(influencer) {
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!userData.user) throw new Error('You must be logged in to add an influencer.')

  const { data, error } = await supabase
    .from('influencers')
    .insert([
      {
        ...influencer,
        created_by: userData.user.id,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteInfluencer(id) {
  const { error } = await supabase
    .from('influencers')
    .delete()
    .eq('id', id)

  if (error) throw error
}