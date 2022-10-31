import { useSelector } from 'react-redux'

function renderRows(x, bid, ask) {
  return (
    <tr>
      <td className="text-right compactCell">
        {bid ? `${bid.liquidity.total.div(1000).toFormat(0)}k` : ''}
      </td>
      <td className="text-right compactCell">{bid ? bid.priceString : ''}</td>
      <td className="text-left compactCell">{ask ? ask.priceString : ''}</td>
      <td className="text-right compactCell">
        {ask ? `${ask.liquidity.total.div(1000).toFormat(0)}k` : ''}
      </td>
    </tr>
  )
}
export function OrderbookTable() {
  const selectorData = useSelector(state => state.uniswap)
  const { orderBook, price } = selectorData
  const rowLength = Math.max(orderBook.bids.length, orderBook.asks.length)

  const rows = []
  Array.from(Array(rowLength)).forEach((_, i) => {
    const bid = orderBook.bids[i]
    const ask = orderBook.asks[i]
    rows.push(renderRows(i, bid, ask))
  })
  return (
    <div className=" bg-darky-300 text-white max-h-[400px] overflow-y-auto w-fit">
      <table>
        <tbody>
          <tr className="sticky top-0 bg-darky-300">
            <th colSpan="2" className="text-center compactCell">
              BIDS
            </th>
            <th colSpan="2" className="text-center compactCell">
              ASKS
            </th>
          </tr>
          <tr className="sticky top-[23px] bg-darky-300">
            <th className="text-right w-[100px] compactCell">LIQUIDITY</th>
            <th className="text-right w-[100px] compactCell">PRICE</th>
            <th className="text-left  compactCell">PRICE</th>
            <th className="text-right w-[100px] compactCell">LIQUIDITY</th>
          </tr>
          {rows}
        </tbody>
      </table>
    </div>
  )
}

export default OrderbookTable
