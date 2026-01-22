'use client'

import { createClientComponentClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export const createClient = () => {
  return createClientComponentClient<Database>()
}
