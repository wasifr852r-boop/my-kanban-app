import { supabase } from './supabaseClients'

export const generateDescription = async (title) => {
  const { data, error } = await supabase.functions.invoke('generate-description', {
    body: { title }
  })
  if (error) throw new Error(error.message)
  return data.text
}