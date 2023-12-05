import BigNumber from 'bignumber.js'
import Header from '../common/Header'
import { useSelector } from 'react-redux'

function formatNumber(number) {
  const num = new BigNumber(number)
  if (num.isNaN()) return '-'
  return `${num.toFixed(2)}%`
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

export function Funding() {
  const data = useSelector(state => state.data.funding)
  // const rows = data.map(renderRow)
  const binance_usdt = renderRow(data.binance_usdt, 'binance_usdt')
  const binance_coin = renderRow(data.binance_coin, 'binance_coin')
  const dydx_v4 = renderRow(data.dydx_v4, 'dydx_v4')
  const dydx_v3 = renderRow(data.dydx_v3, 'dydx_v3')
  const synthetix = renderRow(data.synthetix, 'synthetix')
  const deribit = renderRow(data.deribit, 'deribit')
  const drift = renderRow(data.drift, 'drift')
  return (
    <div className="flex flex-col">
      <Header
        content={{
          title: 'Funding Rates',
          subtitle: 'Annualized Funding Rates for Perpetuals',
        }}
      />
      <div className="overflow-y-auto h-[500px]">
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
            {binance_coin}
            {deribit}
            {drift}
            {dydx_v3}
            {dydx_v4}
            {synthetix}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Funding
