import { createSlice } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js'

const initialState = {
  cbEthPrice: new BigNumber(0),
  cbEthVolume: new BigNumber(0),
  cbBTCPrice: new BigNumber(0),
  cbBTCVolume: new BigNumber(0),
}

export const websocketsSlice = createSlice({
  name: 'websocketsStats',
  initialState,
  reducers: {
    updateCBETHPrice: (state, action) => {
      // console.log('updated eth price')
      state.cbEthPrice = action.payload
    },
    updateCBEETHVolume: (state, action) => {
      state.cbEthVolume = state.cbEthVolume.plus(action.payload)
    },
    updateCBBTCPrice: (state, action) => {
      state.cbBTCPrice = action.payload
    },
    updateCBBTCVolume: (state, action) => {
      state.cbBTCVolume = state.cbBTCVolume.plus(action.payload)
    },
  },
})

export const {
  updateCBETHPrice,
  updateCBEETHVolume,
  updateCBBTCPrice,
  updateCBBTCVolume,
} = websocketsSlice.actions

export default websocketsSlice.reducer
