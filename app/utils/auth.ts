import { createClient } from './client'
import { setUsernameInSession } from './session'

async function checkAuth(username: string, password: string) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('auth')
      .select('username')
      .eq('username', username)
      .eq('password', password)
      .single()

    if (error) throw error

    setUsernameInSession(username)
    return true
  } catch (error) {
    throw new Error('Invalid username or password')
  }
}

export default checkAuth