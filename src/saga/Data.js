import BigNumber from 'bignumber.js'
import { put, delay, fork } from 'redux-saga/effects'
import { updateFunding, updateStEth } from './store/Data'

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

export function* dataSaga() {
  while (true) {
    try {
      yield fork(queryFunding)
      yield fork(queryStEth)
    } catch (error) {
      console.error(error)
    } finally {
      yield delay(60000)
    }
  }
}