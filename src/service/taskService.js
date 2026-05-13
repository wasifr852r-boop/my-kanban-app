import { supabase } from './supabaseClients'

export const fetchTasks = async (userId) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const createTask = async (task) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateTaskInDB = async (id, updates) => {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteTaskFromDB = async (id) => {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}