
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Fallback to a valid-looking URL to prevent crash during initial setup if env vars are missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Basic validation to ensure URL format is correct (starts with http)
const isValidUrl = (url: string) => {
    try {
        return url.startsWith('http://') || url.startsWith('https://')
    } catch {
        return false
    }
}

const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder-project.supabase.co'

if (!isValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || '')) {
    console.warn(
        'Warning: NEXT_PUBLIC_SUPABASE_URL is not a valid URL. Using placeholder. Please update your .env.local file.'
    )
}

export const supabase = createClient<Database>(finalUrl, supabaseAnonKey)
