import Header from '../common/Header'
import { useSelector } from 'react-redux'

export function Funding() {
  const exchangeRate = useSelector(state => state.data.stEth)
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
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="cell text-right">{exchangeRate}</td>
            <td className="cell text-right">WIP</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default Funding
