import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type RequestBody = {
  action: 'createUser' | 'resetPassword'
  name?: string
  email?: string
  password?: string
  role?: 'BRAND_MANAGER' | 'ADMIN'
  userId?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405)
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return jsonResponse(
        { error: 'Missing Supabase environment variables.' },
        500
      )
    }

    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      return jsonResponse({ error: 'Missing Authorization header.' }, 401)
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    })

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser()

    if (authError || !user) {
      return jsonResponse({ error: 'Unauthorized.' }, 401)
    }

    const { data: currentProfile, error: profileError } = await adminClient
      .from('users')
      .select('id, role, is_active')
      .eq('id', user.id)
      .single()

    if (profileError || !currentProfile) {
      return jsonResponse({ error: 'Admin profile not found.' }, 403)
    }

    if (currentProfile.role !== 'ADMIN' || !currentProfile.is_active) {
      return jsonResponse({ error: 'Admin access required.' }, 403)
    }

    const body = (await req.json()) as RequestBody

    if (body.action === 'createUser') {
      return await createUser(body, adminClient)
    }

    if (body.action === 'resetPassword') {
      return await resetPassword(body, adminClient)
    }

    return jsonResponse({ error: 'Invalid action.' }, 400)
  } catch (error) {
    console.error(error)

    return jsonResponse(
      {
        error:
          error instanceof Error ? error.message : 'Unexpected server error.',
      },
      500
    )
  }
})

async function createUser(body: RequestBody, adminClient: any) {
  const email = body.email?.trim()
  const password = body.password?.trim()
  const name = body.name?.trim()
  const role = body.role || 'BRAND_MANAGER'

  if (!email || !password || !name) {
    return jsonResponse(
      { error: 'Name, email, and temporary password are required.' },
      400
    )
  }

  if (!['BRAND_MANAGER', 'ADMIN'].includes(role)) {
    return jsonResponse({ error: 'Invalid user role.' }, 400)
  }

  const { data: authData, error: createAuthError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

  if (createAuthError) {
    return jsonResponse({ error: createAuthError.message }, 400)
  }

  const newUser = authData.user

  if (!newUser) {
    return jsonResponse({ error: 'Auth user was not created.' }, 500)
  }

  const { data: profile, error: profileError } = await adminClient
    .from('users')
    .upsert(
      {
        id: newUser.id,
        email,
        name,
        role,
        is_active: true,
      },
      { onConflict: 'id' }
    )
    .select()
    .single()

  if (profileError) {
    return jsonResponse({ error: profileError.message }, 400)
  }

  return jsonResponse({
    message: 'User created successfully.',
    user: profile,
  })
}

async function resetPassword(body: RequestBody, adminClient: any) {
  const userId = body.userId
  const password = body.password?.trim()

  if (!userId || !password) {
    return jsonResponse(
      { error: 'User ID and new temporary password are required.' },
      400
    )
  }

  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    password,
  })

  if (error) {
    return jsonResponse({ error: error.message }, 400)
  }

  return jsonResponse({
    message: 'Password reset successfully.',
  })
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}