import { ApolloClient, InMemoryCache } from '@apollo/client'
import gql from 'graphql-tag'
import { put } from 'redux-saga/effects'
import BigNumber from 'bignumber.js'
import { updateApr } from './store/Lido'

const poolQuery = gql`
  query totalRewards {
    totalRewards(first: 7, orderBy: block, orderDirection: desc) {
      apr
    }
  }
`

export const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/lidofinance/lido',
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})

const fetchLidoAPR = async () => {
  const { data, error, loading } = await client.query({
    query: poolQuery,
  })

  if (loading || error || !data) {
    return {
      loading,
      error: Boolean(error),
      data: undefined,
    }
  }

  return { data, loading, error: false }
}

export function* queryLido() {
  try {
    const result = yield fetchLidoAPR()
    const { data, error, loading } = result

    if (!error && !loading) {
      const { totalRewards } = data
      const apr1 = new BigNumber(totalRewards[0].apr).toFormat(2)
      let total = new BigNumber(0)
      for (const reward of totalRewards) {
        total = total.plus(reward.apr)
      }
      const apr7 = total.dividedBy(totalRewards.length).toFormat(2)
      yield put(
        updateApr({
          apr1,
          apr7,
        })
      )
    }
  } catch (error) {
    console.error(error)
  }
}
