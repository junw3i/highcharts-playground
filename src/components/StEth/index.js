import Header from '../common/Header'
import { useSelector } from 'react-redux'

export function Funding() {
  const exchangeRate = useSelector(state => state.data.stEth)
  const apr = useSelector(state => state.lido.data)
  const { apr1, apr7 } = apr
  return (
    <div className="flex flex-col">
      <Header
        content={{
          title: 'Lido Staked ETH',
          subtitle: 'Exchange Rates and APR',
        }}
      />
      <table className="cell bg-darky-300 text-white">
        <thead>
          <tr>
            <th className="cell text-right">EXCHANGE RATE</th>
            <th className="cell text-right">7D AVG APR</th>
            <th className="cell text-right">1D AVG APR</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="cell text-right">{exchangeRate}</td>
            <td className="cell text-right">{apr7}%</td>
            <td className="cell text-right">{apr1}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default Funding
