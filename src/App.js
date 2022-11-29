import './App.css'
import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client'
import { Provider } from 'react-redux'
import { store } from './saga/store'
import Chart from './components/Chart'
import MarketData from './components/MarketData'
import Orderbook from './components/Orderbook'
import Funding from './components/Funding'
import StEth from './components/StEth'
import { sub } from 'date-fns'

const dayInMs = 1000 * 60 * 60 * 24
const fullDays = Math.floor(new Date() / dayInMs) * dayInMs

// 30 days ago range to last full day
const monthStartEnd = {
  from: sub(new Date(fullDays), { days: 30 }),
  to: sub(new Date(fullDays), { seconds: 1 }),
}

// Converting JS dates to unix time
const blockTimes = {
  from: Math.round(monthStartEnd.from / 1000),
  to: Math.round(monthStartEnd.to / 1000),
}

console.log(blockTimes)
// const monthRewardsQuery = gql`
//   {
//     totalRewards(first: 1000, where: {
//         blockTime_gte: ${blockTimes.from},
//         blockTime_lte: ${blockTimes.to} }) {
//           totalRewards
//     }
//   }
// `
// console.log(monthRewardsQuery)

// {
//   totalRewards(first: 10, orderBy: block, orderDirection: desc) {
//     apr
//     aprRaw
//     timeElapsed
//     block
//     blockTime
//   }
// }

function App() {
  const client = new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/lidofinance/lido',
    cache: new InMemoryCache(),
  })

  // client
  //   .query({
  //     query: gql(monthRewardsQuery),
  //   })
  //   .then(data => console.log('Subgraph data: ', data))
  //   .catch(err => {
  //     console.log('Error fetching data: ', err)
  //   })

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
