import { configureStore } from '@reduxjs/toolkit'
import websocketsReducer from './Websockets'
import UniswapReducer from './Uniswap'
import FundingReducer from './Funding'
import createSagaMiddleware from 'redux-saga'
import { rootSaga } from '..'
import { combineReducers } from 'redux'

const sagaMiddleware = createSagaMiddleware()

const reducer = combineReducers({
  // here we will be adding reducers
  ws: websocketsReducer,
  uniswap: UniswapReducer,
  funding: FundingReducer,
})

export const store = configureStore({
  reducer,
  middleware: [sagaMiddleware],
})

sagaMiddleware.run(rootSaga)
