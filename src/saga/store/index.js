import { configureStore } from '@reduxjs/toolkit'
import websocketsReducer from './Websockets'
import UniswapReducer from './Uniswap'
import LidoReducer from './Lido'
import DataReducer from './Data'
import createSagaMiddleware from 'redux-saga'
import { rootSaga } from '..'
import { combineReducers } from 'redux'

const sagaMiddleware = createSagaMiddleware()

const reducer = combineReducers({
  // here we will be adding reducers
  ws: websocketsReducer,
  uniswap: UniswapReducer,
  data: DataReducer,
  lido: LidoReducer,
})

export const store = configureStore({
  reducer,
  middleware: [sagaMiddleware],
})

sagaMiddleware.run(rootSaga)
