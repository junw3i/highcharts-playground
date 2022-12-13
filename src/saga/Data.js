import BigNumber from 'bignumber.js'
import { put, delay, fork } from 'redux-saga/effects'
import { updateFunding, updateStEth, updateStride } from './store/Data'

const fetchFunding = async () => {
  const url = `https://cjw.hosehbo.xyz/funding`
  const response = await fetch(url)
  const data = await response.json()
  return data
}

function* queryFunding() {
  const data = yield fetchFunding()
  const formattedData = data.map(row => ({
    ...row,
    next_apr: new BigNumber(row.next_apr).toFormat(2),
    last_apr: new BigNumber(row.last_apr).toFormat(2),
    avg_apr: new BigNumber(row.avg_apr).toFormat(2),
  }))
  yield put(updateFunding(formattedData))
}

const fetchStEthRate = async () => {
  const url = `https://cjw.hosehbo.xyz/funding/steth`
  const response = await fetch(url)
  const data = await response.json()
  return data
}

function* queryStEth() {
  const data = yield fetchStEthRate()
  yield put(updateStEth(new BigNumber(data).shiftedBy(-18).toFormat(4)))
}

const fetchStrideApi = async () => {
  const url = `https://stride-api.polkachu.com/Stride-Labs/stride/stakeibc/host_zone`
  const response = await fetch(url)
  const data = await response.json()
  return data.host_zone
}

function* queryStride() {
  const defaultRate = {
    atom: '0.0000',
    osmo: '0.0000',
  }
  const data = yield fetchStrideApi()
  for (const chain of data) {
    const { chain_id, redemption_rate } = chain
    if (chain_id === 'cosmoshub-4') {
      defaultRate.atom = new BigNumber(redemption_rate).toFormat(4)
    }
    if (chain_id === 'osmosis-1') {
      defaultRate.osmo = new BigNumber(redemption_rate).toFormat(4)
    }
  }
  yield put(updateStride(defaultRate))
}

export function* dataSaga() {
  while (true) {
    try {
      yield fork(queryFunding)
      yield fork(queryStEth)
      yield fork(queryStride)
    } catch (error) {
      console.error(error)
    } finally {
      yield delay(60000)
    }
  }
}
