import { supabase } from './supabaseClient'

export async function getCampaigns() {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createCampaign(campaign) {
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!userData.user) throw new Error('You must be logged in to create a campaign.')

  const { data, error } = await supabase
    .from('campaigns')
    .insert([
      {
        ...campaign,
        brand_manager_id: userData.user.id,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCampaignStatus(id, status) {
  const { data, error } = await supabase
    .from('campaigns')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCampaign(id) {
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id)

  if (error) throw error
}