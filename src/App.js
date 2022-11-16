import './App.css'
import { Provider } from 'react-redux'
import { store } from './saga/store'
import Chart from './components/Chart'
import MarketData from './components/MarketData'
import Orderbook from './components/Orderbook'
import Funding from './components/Funding'

function App() {
  return (
    <Provider store={store}>
      <div className="font-roboto px-4 sm:px-0">
        <MarketData />
        <div className="flex">
          <Orderbook />
          <Funding />
        </div>
        <Chart />
      </div>
    </Provider>
  )
}

export default App
