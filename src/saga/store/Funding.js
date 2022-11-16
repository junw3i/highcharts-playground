import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  data: [],
}

export const fundingSlice = createSlice({
  name: 'fundingStats',
  initialState,
  reducers: {
    updateFunding: (state, action) => {
      state.data = action.payload
    },
  },
})

export const { updateFunding } = fundingSlice.actions

export default fundingSlice.reducer
