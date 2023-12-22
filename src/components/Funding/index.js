import BigNumber from 'bignumber.js'
import Header from '../common/Header'
import { useSelector } from 'react-redux'

function formatNumber(number) {
  const num = new BigNumber(number)
  if (num.isNaN()) return '-'
  return `${num.toFixed(2)}%`
}
function formatOI(number) {
  const num = new BigNumber(number)
  if (num.isNaN()) return '-'
  return `${num.toFormat(0)}`
}

function renderRow(row, id) {
  if (row) {
    return (
      <tr key={id}>
        <td className="cell">{id}</td>
        <td className="cell text-right">{formatNumber(row.btc)}</td>
        <td className="cell text-right">{formatNumber(row.eth)}</td>
        <td className="cell text-right">{formatNumber(row.sol)}</td>
      </tr>
    )
  }
  return null
}
function renderOIRow(row, id) {
  if (row) {
    return (
      <tr key={`oi-${id}`}>
        <td className="oi"></td>
        <td className="oi text-right">{formatOI(row.btc)}</td>
        <td className="oi text-right">{formatOI(row.eth)}</td>
        <td className="oi text-right">{formatOI(row.sol)}</td>
      </tr>
    )
  }
  return null
}

export function Funding() {
  const data = useSelector(state => state.data.funding)
  const oi = useSelector(state => state.data.oi)
  // const rows = data.map(renderRow)
  const binance_usdt = renderRow(data.binance_usdt, 'bn_usdt')
  const binance_coin = renderRow(data.binance_coin, 'bn_coin')
  const dydx_v4 = renderRow(data.dydx_v4, 'dydx_v4')
  const dydx_v3 = renderRow(data.dydx_v3, 'dydx_v3')
  const synthetix = renderRow(data.synthetix, 'synthetix')
  const deribit = renderRow(data.deribit, 'deribit')
  const drift = renderRow(data.drift, 'drift')
  const hyperliquid = renderRow(data.hyperliquid, 'hyper')

  const binance_usdt_oi = renderOIRow(oi.binance_usdt, 'bn_usdt')
  const binance_coin_oi = renderOIRow(oi.binance_coin, 'bn_coin')
  const dydx_v4_oi = renderOIRow(oi.dydx_v4, 'dydx_v4')
  const dydx_v3_oi = renderOIRow(oi.dydx_v3, 'dydx_v3')
  const synthetix_oi = renderOIRow(oi.synthetix, 'synthetix')
  const deribit_oi = renderOIRow(oi.deribit, 'deribit')
  const drift_oi = renderOIRow(oi.drift, 'drift')
  const hyperliquid_oi = renderOIRow(oi.hyperliquid, 'hyper')
  return (
    <div className="flex flex-col">
      <Header
        content={{
          title: 'Funding & OI',
          subtitle: 'Annualized Funding Rates for Perpetuals',
        }}
      />
      <div className="overflow-y-auto h-[800px]">
        <table className="cell bg-darky-300 text-white">
          <thead>
            <tr>
              <th className="cell text-left">EXCHANGE</th>
              <th className="cell text-right">BTC</th>
              <th className="cell text-right">ETH</th>
              <th className="cell text-right">SOL</th>
            </tr>
          </thead>
          <tbody>
            {binance_usdt}
            {binance_usdt_oi}
            {binance_coin}
            {binance_coin_oi}
            {deribit}
            {deribit_oi}
            {drift}
            {drift_oi}
            {dydx_v3}
            {dydx_v3_oi}
            {dydx_v4}
            {dydx_v4_oi}
            {hyperliquid}
            {hyperliquid_oi}
            {synthetix}
            {synthetix_oi}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Funding
