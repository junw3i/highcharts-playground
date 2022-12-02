import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  data: {
    avg7: '0.00',
    avg1: '0.00',
  },
}

export const lidoSlice = createSlice({
  name: 'lidoStats',
  initialState,
  reducers: {
    updateApr: (state, action) => {
      state.data = action.payload
    },
  },
})

export const { updateApr } = lidoSlice.actions

export default lidoSlice.reducer
