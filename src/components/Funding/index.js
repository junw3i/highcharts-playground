import Header from '../common/Header'
import { useSelector } from 'react-redux'

function renderRow(row, i) {
  const { name, exchange, margin, next_apr, last_apr } = row
  return (
    <tr key={`${i}-funding`}>
      <td className="cell">{name}</td>
      <td className="cell">{exchange}</td>
      <td className="cell">{margin}</td>
      <td className="cell text-right">{next_apr}%</td>
      <td className="cell text-right">{last_apr}%</td>
    </tr>
  )
}

export function Funding() {
  const selectorData = useSelector(state => state.funding)
  const { data } = selectorData
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
        <tr>
          <th className="cell text-left">NAME</th>
          <th className="cell text-left">EXCHANGE</th>
          <th className="cell text-left">MARGIN</th>
          <th className="cell text-right">NEXT APR</th>
          <th className="cell text-right">LAST APR</th>
        </tr>
        {rows}
      </table>
    </div>
  )
}

export default Funding