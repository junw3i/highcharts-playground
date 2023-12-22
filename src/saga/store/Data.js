import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  funding: {},
  oi: {},
}

export const dataSlice = createSlice({
  name: 'dataStats',
  initialState,
  reducers: {
    updateFunding: (state, action) => {
      state.funding = action.payload
    },
    updateOI: (state, action) => {
      state.oi = action.payload
    },
  },
})

export const { updateFunding, updateOI, updateStride } = dataSlice.actions

export default dataSlice.reducer
