import React, { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { formatInTimeZone } from 'date-fns-tz'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

function scrub(d) {
  // [0] unix
  // [1] close
  let min = 999999 // quick hack
  let max = 0
  const scrubbed = []
  for (var i = d.length - 1; i >= 0; i--) {
    max = Math.max(d[i][1], max)
    min = Math.min(d[i][1], min)
    scrubbed.push([d[i][0] * 1000, d[i][4]])
  }
  return { data: scrubbed, min, max }
}

const Chart = () => {
  const [chartData, setChartData] = useState({
    title: {
      text: '',
    },
    chart: {
      backgroundColor: 'transparent',
      showAxes: false,
    },
    xAxis: {
      labels: {
        enabled: false,
      },
      type: 'datetime',
      tickWidth: 0,
      lineWidth: 0,
    },
    yAxis: {
      title: { text: undefined },
      labels: {
        enabled: false,
      },
      endOnTick: false,
      alignTicks: false,
      startOnTick: false,
      gridLineWidth: 0,
      // min: 200,
      // max: 6000,
    },
    credits: { enabled: false },
    legend: { enabled: false },
    series: [
      {
        data: [],
        type: 'line',
        shadow: {
          color: 'rgba(75, 144, 219, 0.2)',
          width: 15,
        },
        color: {
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 1,
            y2: 0,
          },
          stops: [
            [0, '#00FFFB'],
            [1, '#5487F4'],
          ],
        },
      },
    ],
  })

  useEffect(() => {
    fetch('https://api.exchange.coinbase.com/products/ETH-USD/candles?granularity=86400')
      .then(response => response.json())
      .then(d => {
        const srubbedData = scrub(d)
        const { data, min, max } = srubbedData
        setChartData(prevState => ({
          ...prevState,
          series: [{ data }],
          tooltip: {
            backgroundColor: 'transparent',
            useHTML: true,
            borderWidth: 0,
            shadow: false,
            formatter: function () {
              const dt = new Date(this.x)
              const formattedDate = formatInTimeZone(dt, 'UTC', 'dd MMM yyyy')
              const price = new BigNumber(this.y)
              return `
            <div class="font-roboto bg-darky-200 p-4 rounded-lg border border-greyish">
            <div class="text-greyish">${formattedDate}</div>
            <div class="text-white">$${price.toFormat(2)}</div>
            </div>
          `
            },
          },
          xAxis: {
            ...prevState.xAxis,
            min: data[0][0] - (data[data.length - 1][0] - data[0][0]) * 0.02,
            // plotLines: [
            //   {
            //     id: 'eth-start-date',
            //     value: data[0][0],
            //     color: '#8991ad',
            //     width: 1,
            //     label: {
            //       x: 10,
            //       y: 54,
            //       style: { color: '#8991ad' },
            //       align: 'center',
            //       useHTML: true,
            //       formatter: () => `
            //         <div class="flex">
            //           <div class="font-roboto font-light text-slateus-200">
            //           start date
            //           </div>
            //         </div>
            //       `,
            //     },
            //   },
            // ],
          },
          yAxis: {
            ...prevState.yAxis,
            min: min - (max - min) * 0.07,
            // plotLines: [
            //   {
            //     id: 'eth-start-date',
            //     value: min - (max - min) * 0.02,
            //     color: '#8991ad',
            //     width: 1,
            //   },
            // ],
          },
        }))
      })
  }, [])

  // console.log(chartData)

  return (
    <div className="max-w-screen-lg mx-auto my-10 bg-darky-200 flex flex-col p-8 rounded-lg relative">
      <div className="absolute w-9/12 h-5/6 opacity-[0.25] left-[12%] bg-darky-100  blur-[100px]"></div>
      <div className="m-2 font-roboto text-greyish font-light text-m tracking-widest">
        PRICE OF ETH
      </div>
      <HighchartsReact highcharts={Highcharts} options={chartData} />
    </div>
  )
}

export default Chart
