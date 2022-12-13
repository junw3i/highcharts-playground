import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  funding: [],
  stEth: '0',
  stride: {
    atom: '0.000',
    osmo: '0.000',
  },
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
    updateStride: (state, action) => {
      state.stride = action.payload
    },
  },
})

export const { updateFunding, updateStEth, updateStride } = dataSlice.actions

export default dataSlice.reducer
