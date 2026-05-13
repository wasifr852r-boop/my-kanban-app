import { createSlice } from '@reduxjs/toolkit'

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: { tasks: [], loading: false, error: null },
  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload
      state.loading = false
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    addTask: (state, action) => {
      state.tasks.unshift(action.payload)
    },
    updateTask: (state, action) => {
      const i = state.tasks.findIndex(t => t.id === action.payload.id)
      if (i !== -1) state.tasks[i] = action.payload
    },
    removeTask: (state, action) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload)
    },
  },
})

export const { setTasks, setLoading, addTask, updateTask, removeTask } = tasksSlice.actions
export default tasksSlice.reducer