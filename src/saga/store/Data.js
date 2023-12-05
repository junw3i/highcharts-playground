import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  funding: {},
}

export const dataSlice = createSlice({
  name: 'dataStats',
  initialState,
  reducers: {
    updateFunding: (state, action) => {
      state.funding = action.payload
    },
  },
})

export const { updateFunding, updateStEth, updateStride } = dataSlice.actions

export default dataSlice.reducer
