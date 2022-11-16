import { delay, fork, put } from 'redux-saga/effects'

import { coinbaseSaga } from './Websockets'
import { queryUniswap } from './Uniswap'
import { fundingSaga } from './Funding'

export const STATS_REFRESH_RATE = 60000

export function* rootSaga() {
  yield fork(coinbaseSaga)
  yield fork(queryUniswap)
  yield fork(fundingSaga)
}
