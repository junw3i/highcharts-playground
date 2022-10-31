import BigNumber from 'bignumber.js'
import Header from './common/Header'
import useThrottledSelector from '../hooks/useThrottledSelector'

function Value({ opts }) {
  const { key, dp } = opts
  const value = useThrottledSelector(state => state.ws[key], new BigNumber(0))
  return <td className="text-right w-[100px] cell">{value.toFormat(dp)}</td>
}

export function MarketData() {
  return (
    <div className="flex flex-col bg-darky-200">
      <Header
        content={{
          title: 'Market Data',
          subtitle: 'Real time pricing and volume from top exchanges',
        }}
      />
      <div className="bg-darky-300 text-white">
        <table>
          <tbody>
            <tr>
              <th className="text-left w-[100px] cell">ASSET</th>
              <th className="text-right w-[100px] cell">PRICE</th>
              <th className="text-right w-[100px] cell">VOLUME</th>
            </tr>
            <tr>
              <td className="text-left w-[100px] cell">ETH</td>
              <Value opts={{ key: 'cbEthPrice', dp: 2 }} />
              <Value opts={{ key: 'cbEthVolume', dp: 0 }} />
            </tr>
            <tr>
              <td className="text-left w-[100px] cell">BTC</td>
              <Value opts={{ key: 'cbBTCPrice', dp: 2 }} />
              <Value opts={{ key: 'cbBTCVolume', dp: 0 }} />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MarketData
