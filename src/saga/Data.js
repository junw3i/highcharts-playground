// import BigNumber from 'bignumber.js'
import { put, delay, fork } from 'redux-saga/effects'
import { updateFunding, updateOI } from './store/Data'

const fetchFunding = async () => {
  const url = `https://cjw.hosehbo.xyz/funding`
  const response = await fetch(url)
  const data = await response.json()
  return data
}
const fetchOI = async () => {
  const url = `https://cjw.hosehbo.xyz/funding/oi`
  const response = await fetch(url)
  const data = await response.json()
  return data
}

function* queryFunding() {
  const data = yield fetchFunding()
  const oi = yield fetchOI()
  // console.log(data)
  // const formattedData = data.map(row => ({
  //   ...row,
  //   next_apr: new BigNumber(row.next_apr).toFormat(2),
  //   last_apr: new BigNumber(row.last_apr).toFormat(2),
  //   avg_apr: new BigNumber(row.avg_apr).toFormat(2),
  // }))
  yield put(updateFunding(data))
  yield put(updateOI(oi))
}

export function* dataSaga() {
  while (true) {
    try {
      yield fork(queryFunding)
    } catch (error) {
      console.error(error)
    } finally {
      yield delay(120000)
    }
  }
}
