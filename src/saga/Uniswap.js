import { ApolloClient, InMemoryCache } from '@apollo/client'
import gql from 'graphql-tag'
import { Token, CurrencyAmount, Price } from '@uniswap/sdk-core'
import {
  TickMath,
  tickToPrice,
  TICK_SPACINGS,
  Pool,
  priceToClosestTick,
} from '@uniswap/v3-sdk'
import keyBy from 'lodash.keyby'
import JSBI from 'jsbi'
import { put, all, call } from 'redux-saga/effects'
import { BigNumber as BN } from '@ethersproject/bignumber'
import BigNumber from 'bignumber.js'
import { updateOrderbook, updateCurrentPrice } from './store/Uniswap'

const POOL5 = '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640'
const POOL30 = '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8'
const POOL100 = '0x7bea39867e4169dbe237d55c8242a8f2fcdcc387'
export const MAX_UINT128 = BN.from(2).pow(128).sub(1)
const PRICE_FIXED_DIGITS = 4
const FEE_TIER_TO_TICK_SPACING = feeTier => {
  switch (feeTier) {
    case '10000':
      return 200
    case '3000':
      return 60
    case '500':
      return 10
    case '100':
      return 1
    default:
      throw Error(`Tick spacing for fee tier ${feeTier} undefined.`)
  }
}

export const fetchData = async url => {
  const response = await fetch(url)
  const data = await response.json()
  return data
}

const roundNumber = (num, inLotsOf) => {
  const num2 = num.div(inLotsOf).dp(0, BigNumber.ROUND_HALF_EVEN).times(inLotsOf)
  return num2.toNumber()
}
// const poolAddress = '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640'

const poolQuery = gql`
  query pool($poolAddress: String!) {
    pool(id: $poolAddress) {
      tick
      token0 {
        symbol
        id
        decimals
      }
      token1 {
        symbol
        id
        decimals
      }
      feeTier
      sqrtPrice
      liquidity
    }
  }
`

export const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
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

const fetchInitializedTicks = async (
  poolAddress,
  tickIdxLowerBound,
  tickIdxUpperBound,
  client
) => {
  const tickQuery = gql`
    query surroundingTicks(
      $poolAddress: String!
      $tickIdxLowerBound: BigInt!
      $tickIdxUpperBound: BigInt!
      $skip: Int!
    ) {
      ticks(
        subgraphError: allow
        first: 1000
        skip: $skip
        where: {
          poolAddress: $poolAddress
          tickIdx_lte: $tickIdxUpperBound
          tickIdx_gte: $tickIdxLowerBound
        }
      ) {
        tickIdx
        liquidityGross
        liquidityNet
        price0
        price1
      }
    }
  `

  let surroundingTicks = []
  let surroundingTicksResult = []
  let skip = 0
  do {
    const { data, error, loading } = await client.query({
      query: tickQuery,
      fetchPolicy: 'cache-first',
      variables: {
        poolAddress,
        tickIdxLowerBound,
        tickIdxUpperBound,
        skip,
      },
    })

    // console.log({ data, error, loading }, 'Result. Skip: ' + skip)

    if (loading) {
      continue
    }

    if (error) {
      return { error: Boolean(error), loading, ticks: surroundingTicksResult }
    }

    surroundingTicks = data.ticks
    surroundingTicksResult = surroundingTicksResult.concat(surroundingTicks)
    skip += 1000
  } while (surroundingTicks.length > 0)

  return { ticks: surroundingTicksResult, loading: false, error: false }
}

const fetchTicksSurroundingPrice = async poolAddress => {
  const {
    data: poolResult,
    error,
    loading,
  } = await client.query({
    query: poolQuery,
    variables: {
      poolAddress,
    },
  })

  if (loading || error || !poolResult) {
    return {
      loading,
      error: Boolean(error),
      data: undefined,
    }
  }

  const {
    pool: {
      tick: poolCurrentTick,
      feeTier,
      liquidity,
      token0: { id: token0Address, decimals: token0Decimals },
      token1: { id: token1Address, decimals: token1Decimals },
    },
  } = poolResult

  const poolCurrentTickIdx = parseInt(poolCurrentTick)
  const tickSpacing = FEE_TIER_TO_TICK_SPACING(feeTier)

  // The pools current tick isn't necessarily a tick that can actually be initialized.
  // Find the nearest valid tick given the tick spacing.
  const activeTickIdx = Math.floor(poolCurrentTickIdx / tickSpacing) * tickSpacing

  const token0 = new Token(1, token0Address, parseInt(token0Decimals))
  const token1 = new Token(1, token1Address, parseInt(token1Decimals))

  // fetch the upper and lower bound tick
  // currently hardcode to +-10% from the current price
  const currentPrice = parseFloat(
    tickToPrice(token1, token0, poolCurrentTickIdx).toFixed(PRICE_FIXED_DIGITS)
  )

  // determine search bounds
  const boundaryAmount = currentPrice * 0.2
  const lowerBoundPrice = parseInt(currentPrice - boundaryAmount)
  const upperBoundPrice = parseInt(currentPrice + boundaryAmount)

  const tickIdxUpperBound = priceToClosestTick(
    new Price(token1, token0, 1e18, lowerBoundPrice * 1e6)
  )
  const tickIdxLowerBound = priceToClosestTick(
    new Price(token1, token0, 1e18, upperBoundPrice * 1e6)
  )

  const initializedTicksResult = await fetchInitializedTicks(
    poolAddress,
    tickIdxLowerBound,
    tickIdxUpperBound,
    client
  )

  if (initializedTicksResult.error || initializedTicksResult.loading) {
    return {
      error: initializedTicksResult.error,
      loading: initializedTicksResult.loading,
    }
  }

  const { ticks: initializedTicks } = initializedTicksResult

  let upperLength = 0
  let lowerLength = 0
  initializedTicks.forEach(tick => {
    if (parseInt(tick.tickIdx) > parseInt(activeTickIdx)) {
      upperLength += 1
    }
    if (parseInt(tick.tickIdx) < parseInt(activeTickIdx)) {
      lowerLength += 1
    }
  })

  const tickIdxToInitializedTick = keyBy(initializedTicks, 'tickIdx')

  // If the pool's tick is MIN_TICK (-887272), then when we find the closest
  // initializable tick to its left, the value would be smaller than MIN_TICK.
  // In this case we must ensure that the prices shown never go below/above.
  // what actual possible from the protocol.
  let activeTickIdxForPrice = activeTickIdx
  if (activeTickIdxForPrice < TickMath.MIN_TICK) {
    activeTickIdxForPrice = TickMath.MIN_TICK
  }
  if (activeTickIdxForPrice > TickMath.MAX_TICK) {
    activeTickIdxForPrice = TickMath.MAX_TICK
  }

  // const upper = tickToPrice(token1, token0, tickIdxLowerBound).toFixed(PRICE_FIXED_DIGITS)
  // const lower = tickToPrice(token1, token0, tickIdxUpperBound).toFixed(PRICE_FIXED_DIGITS)
  // console.log('lower', lower)
  // console.log('upper', upper)

  const activeTickProcessed = {
    liquidityActive: JSBI.BigInt(liquidity),
    tickIdx: activeTickIdx,
    liquidityNet: JSBI.BigInt(0),
    price0: tickToPrice(token0, token1, activeTickIdxForPrice).toFixed(
      PRICE_FIXED_DIGITS
    ),
    price1: tickToPrice(token1, token0, activeTickIdxForPrice).toFixed(
      PRICE_FIXED_DIGITS
    ),
    liquidityGross: JSBI.BigInt(0),
  }

  // If our active tick happens to be initialized (i.e. there is a position that starts or
  // ends at that tick), ensure we set the gross and net.
  // correctly.
  const activeTick = tickIdxToInitializedTick[activeTickIdx]
  if (activeTick) {
    activeTickProcessed.liquidityGross = JSBI.BigInt(activeTick.liquidityGross)
    activeTickProcessed.liquidityNet = JSBI.BigInt(activeTick.liquidityNet)
  }

  // Computes the numSurroundingTicks above or below the active tick.
  const computeSurroundingTicks = (
    activeTickProcessed,
    tickSpacing,
    numSurroundingTicks,
    direction
  ) => {
    let previousTickProcessed = {
      ...activeTickProcessed,
    }

    // Iterate outwards (either up or down depending on 'Direction') from the active tick,
    // building active liquidity for every tick.
    let processedTicks = []
    for (let i = 0; i < numSurroundingTicks; i++) {
      const currentTickIdx =
        direction == 0
          ? previousTickProcessed.tickIdx + tickSpacing
          : previousTickProcessed.tickIdx - tickSpacing

      if (currentTickIdx < TickMath.MIN_TICK || currentTickIdx > TickMath.MAX_TICK) {
        break
      }

      const currentTickProcessed = {
        liquidityActive: previousTickProcessed.liquidityActive,
        tickIdx: currentTickIdx,
        liquidityNet: JSBI.BigInt(0),
        price0: tickToPrice(token0, token1, currentTickIdx).toFixed(PRICE_FIXED_DIGITS),
        price1: tickToPrice(token1, token0, currentTickIdx).toFixed(PRICE_FIXED_DIGITS),
        liquidityGross: JSBI.BigInt(0),
      }

      // Check if there is an initialized tick at our current tick.
      // If so copy the gross and net liquidity from the initialized tick.
      const currentInitializedTick = tickIdxToInitializedTick[currentTickIdx.toString()]
      if (currentInitializedTick) {
        currentTickProcessed.liquidityGross = JSBI.BigInt(
          currentInitializedTick.liquidityGross
        )
        currentTickProcessed.liquidityNet = JSBI.BigInt(
          currentInitializedTick.liquidityNet
        )
      }

      // Update the active liquidity.
      // If we are iterating ascending and we found an initialized tick we immediately apply
      // it to the current processed tick we are building.
      // If we are iterating descending, we don't want to apply the net liquidity until the following tick.
      if (direction == 0 && currentInitializedTick) {
        currentTickProcessed.liquidityActive = JSBI.add(
          previousTickProcessed.liquidityActive,
          JSBI.BigInt(currentInitializedTick.liquidityNet)
        )
      } else if (
        direction == 1 &&
        JSBI.notEqual(previousTickProcessed.liquidityNet, JSBI.BigInt(0))
      ) {
        // We are iterating descending, so look at the previous tick and apply any net liquidity.
        currentTickProcessed.liquidityActive = JSBI.subtract(
          previousTickProcessed.liquidityActive,
          previousTickProcessed.liquidityNet
        )
      }

      processedTicks.push(currentTickProcessed)
      previousTickProcessed = currentTickProcessed
    }

    if (direction == 1) {
      processedTicks = processedTicks.reverse()
    }

    return processedTicks
  }

  const subsequentTicks = computeSurroundingTicks(
    activeTickProcessed,
    tickSpacing,
    lowerLength,
    0
  )

  const previousTicks = computeSurroundingTicks(
    activeTickProcessed,
    tickSpacing,
    upperLength,
    1
  )

  const ticksProcessed = previousTicks.concat(activeTickProcessed).concat(subsequentTicks)

  return {
    data: {
      ticksProcessed,
      feeTier,
      tickSpacing,
      activeTickIdx,
    },
    token0,
    token1,
    currentPrice,
  }
}

const processData = async data => {
  return await Promise.all(
    data.data.ticksProcessed.map(async (t, i) => {
      const active = t.tickIdx === data.data.activeTickIdx
      const sqrtPriceX96 = TickMath.getSqrtRatioAtTick(t.tickIdx)
      const feeAmount = parseInt(data.data.feeTier)
      const mockTicks = [
        {
          index: t.tickIdx - TICK_SPACINGS[feeAmount],
          liquidityGross: t.liquidityGross,
          liquidityNet: JSBI.multiply(t.liquidityNet, JSBI.BigInt('-1')),
        },
        {
          index: t.tickIdx,
          liquidityGross: t.liquidityGross,
          liquidityNet: t.liquidityNet,
        },
      ]
      const pool = new Pool(
        data.token0,
        data.token1,
        parseInt(data.data.feeTier),
        sqrtPriceX96,
        t.liquidityActive,
        t.tickIdx,
        mockTicks
      )

      const nextSqrtX96 = data.data.ticksProcessed[i - 1]
        ? TickMath.getSqrtRatioAtTick(data.data.ticksProcessed[i - 1].tickIdx)
        : undefined
      const maxAmountToken0 = data.token0
        ? CurrencyAmount.fromRawAmount(data.token0, MAX_UINT128.toString())
        : undefined
      const outputRes0 =
        pool && maxAmountToken0
          ? await pool.getOutputAmount(maxAmountToken0, nextSqrtX96)
          : undefined

      const token1Amount = outputRes0?.[0]

      const amount0 = token1Amount
        ? parseFloat(token1Amount.toExact()) * parseFloat(t.price1)
        : 0
      const amount1 = token1Amount ? parseFloat(token1Amount.toExact()) : 0

      return {
        index: i,
        isCurrent: active,
        activeLiquidity: parseFloat(t.liquidityActive.toString()),
        price0: parseFloat(t.price0),
        price1: parseFloat(t.price1),
        tvlToken0: amount0,
        tvlToken1: amount1,
      }
    })
  )
}

function buildOrderBook(booksData, currentPrice) {
  const bids = {}
  const asks = {}
  const bidsArray = []
  const asksArray = []
  for (let book of booksData) {
    const { bookData, bps } = book
    for (let i = bookData.length - 1; i > 0; i--) {
      // ignores the last entry as tvl is inaccurate
      const { price1 } = bookData[i]
      const priceBN = new BigNumber(price1)
      const roundedPrice = roundNumber(priceBN, 5)
      const roundedPriceStr = roundNumber(priceBN, 5).toString()
      if (priceBN.gt(currentPrice)) {
        // add to asks
        const tvl = new BigNumber(bookData[i].tvlToken1).times(priceBN)
        if (roundedPriceStr in asks) {
          asks[roundedPrice].total = asks[roundedPrice].total.plus(tvl)
          if (bps in asks[roundedPrice]) {
            asks[roundedPrice][bps] = asks[roundedPrice][bps].plus(tvl)
          } else {
            asks[roundedPrice][bps] = tvl
          }
        } else {
          asks[roundedPrice] = {
            total: tvl,
            [bps]: tvl,
          }
        }
      } else if (priceBN.lt(currentPrice)) {
        // add to bids
        const tvl = new BigNumber(bookData[i].tvlToken0)
        if (roundedPriceStr in bids) {
          bids[roundedPrice].total = bids[roundedPrice].total.plus(tvl)
          if (bps in bids[roundedPrice]) {
            bids[roundedPrice][bps] = bids[roundedPrice][bps].plus(tvl)
          } else {
            bids[roundedPrice][bps] = tvl
          }
        } else {
          bids[roundedPrice] = {
            total: tvl,
            [bps]: tvl,
          }
        }
      }
    }
  }

  for (var bid in bids) {
    const priceLevel = new BigNumber(bid)
    bidsArray.push({
      priceLevel,
      priceString: priceLevel.toFixed(0),
      liquidity: bids[bid],
    })
  }
  for (var ask in asks) {
    const priceLevel = new BigNumber(ask)
    asksArray.push({
      priceLevel: new BigNumber(ask),
      priceString: priceLevel.toFixed(0),
      liquidity: asks[ask],
    })
  }
  bidsArray.sort(function (a, b) {
    if (b.priceLevel.gt(a.priceLevel)) return 1
    if (a.priceLevel.gt(b.priceLevel)) return -1
    return 0
  })
  asksArray.sort(function (a, b) {
    if (b.priceLevel.gt(a.priceLevel)) return -1
    if (a.priceLevel.gt(b.priceLevel)) return 1
    return 0
  })

  return {
    bids: bidsArray,
    asks: asksArray,
  }
}

export function* queryUniswap() {
  try {
    let [data5, data30] = yield all([
      call(fetchTicksSurroundingPrice, POOL5),
      call(fetchTicksSurroundingPrice, POOL30),
    ])
    // let data = yield fetchTicksSurroundingPrice()
    const { currentPrice } = data5

    const [processData5, processData30] = yield all([
      call(processData, data5),
      call(processData, data30),
    ])

    const orderBook = buildOrderBook(
      [
        {
          bps: '5',
          bookData: processData5,
        },
        {
          bps: '30',
          bookData: processData30,
        },
      ],
      currentPrice
    )

    console.log(orderBook)

    yield put(updateOrderbook(orderBook))
    yield put(updateCurrentPrice(currentPrice))
  } catch (error) {
    console.error(error)
  }
}
