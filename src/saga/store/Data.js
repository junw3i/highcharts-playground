import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  funding: [],
  stEth: '0',
}

export const dataSlice = createSlice({
  name: 'dataStats',
  initialState,
  reducers: {
    updateFunding: (state, action) => {
      state.funding = action.payload
    },
    updateStEth: (state, action) => {
      state.stEth = action.payload
    },
  },
})

export const { updateFunding, updateStEth } = dataSlice.actions

export default dataSlice.reducer
