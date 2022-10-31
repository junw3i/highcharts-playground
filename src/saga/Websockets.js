import BigNumber from 'bignumber.js'
import { eventChannel, throttle } from 'redux-saga'
import { put, take, call } from 'redux-saga/effects'
import {
  updateCBETHPrice,
  updateCBEETHVolume,
  updateCBBTCPrice,
  updateCBBTCVolume,
} from './store/Websockets'

function initWebsocket() {
  return eventChannel(emitter => {
    const ws = new WebSocket('wss://ws-feed.pro.coinbase.com')
    // const ws = new WebSocket('wss://fstream.binance.com/stream?streams=btcusdt@aggTrade')
    ws.onopen = () => {
      console.log(`${new Date()}: connecting to coinbase ws...`)
      const message = {
        type: 'subscribe',
        channels: ['matches'],
        product_ids: ['ETH-USD', 'BTC-USD'],
      }
      ws.send(JSON.stringify(message))
    }
    ws.onclose = () => {
      console.log('coinbase disconnected, reconnecting in 3 seconds')
      setTimeout(function () {
        initWebsocket()
      }, 3000)
    }
    ws.onerror = error => {
      console.log('WebSocket error ' + error)
      console.dir(error)
    }
    ws.onmessage = e => {
      let msg = null
      try {
        msg = JSON.parse(e.data)
      } catch (e) {
        console.error(`Error parsing : ${e.data}`)
      }

      if (msg) {
        const { type, price, size, product_id } = msg
        if (type === 'match') {
          const priceBN = new BigNumber(price)
          const volumeBN = new BigNumber(size).times(price)
          switch (product_id) {
            case 'ETH-USD':
              emitter({ type: updateCBETHPrice, payload: priceBN })
              emitter({ type: updateCBEETHVolume, payload: volumeBN })
              break
            case 'BTC-USD':
              emitter({ type: updateCBBTCPrice, payload: priceBN })
              emitter({ type: updateCBBTCVolume, payload: volumeBN })
              break
            default:
            // nothing to do
          }
        }
      }
    }
    // unsubscribe function
    return () => {
      console.log('Socket off')
    }
  })
}
export function* coinbaseSaga() {
  const channel = yield call(initWebsocket)
  while (true) {
    const action = yield take(channel)
    yield put(action)
  }
}
