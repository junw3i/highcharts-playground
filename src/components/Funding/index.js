import Header from '../common/Header'
import { useSelector } from 'react-redux'

function renderRow(row, i) {
  const { name, exchange, margin, next_apr, last_apr, avg_apr } = row
  return (
    <tr key={`${i}-funding`}>
      <td className="cell">{name}</td>
      <td className="cell">{exchange}</td>
      <td className="cell">{margin}</td>
      <td className="cell text-right">{next_apr}%</td>
      <td className="cell text-right">{last_apr}%</td>
      <td className="cell text-right">{avg_apr}%</td>
    </tr>
  )
}

export function Funding() {
  const data = useSelector(state => state.data.funding)
  const rows = data.map(renderRow)
  return (
    <div className="flex flex-col">
      <Header
        content={{
          title: 'Funding Rates',
          subtitle: 'Annualized Funding Rates for ETH Perptuals',
        }}
      />
      <table className="cell bg-darky-300 text-white">
        <thead>
          <tr>
            <th className="cell text-left">NAME</th>
            <th className="cell text-left">EXCHANGE</th>
            <th className="cell text-left">MARGIN</th>
            <th className="cell text-right">NEXT APR</th>
            <th className="cell text-right">LAST APR</th>
            <th className="cell text-right">AVG APR</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  )
}

export default Funding
