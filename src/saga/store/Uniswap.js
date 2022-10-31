import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  orderBook: {
    bids: [],
    asks: [],
  },
  price: 0,
}

export const uniswapSlice = createSlice({
  name: 'uniswapStats',
  initialState,
  reducers: {
    updateOrderbook: (state, action) => {
      state.orderBook = action.payload
    },
    updateCurrentPrice: (state, action) => {
      state.price = action.payload
    },
  },
})

export const { updateOrderbook, updateCurrentPrice } = uniswapSlice.actions

export default uniswapSlice.reducer
