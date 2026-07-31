import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mfflymtrjwvddrlhadap.supabase.co'
const supabaseKey = 'sb_publishable_IAneX6awrc3VpVxG_7v-aQ_nb8h2m41'

export const supabase = createClient(supabaseUrl, supabaseKey)