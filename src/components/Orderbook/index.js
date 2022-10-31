import Header from '../common/Header'
import OrderbookTable from './OrderbookTable'

export function Orderbook() {
  return (
    <div className="flex flex-col bg-darky-200">
      <Header
        content={{
          title: 'Orderbook',
          subtitle: 'Aggreated ETH/USD Uniswap liquidity from the highest 3 pools',
        }}
      />
      <OrderbookTable />
    </div>
  )
}

export default Orderbook
