import './App.css'
import { Provider } from 'react-redux'
import { store } from './saga/store'
import Chart from './components/Chart'
import MarketData from './components/MarketData'
import Orderbook from './components/Orderbook'
import Funding from './components/Funding'
import StEth from './components/StEth'

function App() {
  return (
    <Provider store={store}>
      <div className="font-roboto px-4 sm:px-0">
        <div className="flex flex-col sm:flex-row">
          <MarketData />
          <StEth />
        </div>
        <div className="flex flex-col sm:flex-row">
          <Funding />
          <Orderbook />
        </div>
        <Chart />
      </div>
    </Provider>
  )
}

export default App
