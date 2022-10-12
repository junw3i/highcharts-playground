import React, { useEffect, useState } from 'react'
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
      text: 'My chart',
    },
    chart: {
      backgroundColor: 'transparent',
      showAxes: false,
    },
    xAxis: {
      // title: { text: undefined },
      // labels: {
      //   enabled: true,
      // },
      labels: {
        // style: { color: colors.slateus400 },
        enabled: false,
      },
      type: 'datetime',
      tickWidth: 0,
      lineWidth: 0,
      // minPadding: 0.04,
      // maxPadding: 0.04,
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
          xAxis: {
            ...prevState.xAxis,
            min: data[0][0] - (data[data.length - 1][0] - data[0][0]) * 0.02,
            plotLines: [
              {
                id: 'eth-start-date',
                value: data[0][0],
                color: '#8991ad',
                width: 1,
                label: {
                  x: 10,
                  y: 54,
                  style: { color: '#8991ad' },
                  align: 'center',
                  useHTML: true,
                  formatter: () => `
                    <div class="flex">
                      <div class="font-roboto font-light text-slateus-200">
                      start date
                      </div>
                    </div>
                  `,
                },
              },
            ],
          },
          yAxis: {
            ...prevState.yAxis,
            min: min - (max - min) * 0.07,
            plotLines: [
              {
                id: 'eth-start-date',
                value: min - (max - min) * 0.02,
                color: '#8991ad',
                width: 1,
              },
            ],
          },
        }))
      })
  }, [])

  // if (options.series[0].data.length === 0) return null
  // options.series[0].data = data
  console.log(chartData)

  return (
    <div className="max-w-screen-lg mx-auto my-10 bg-darky-200">
      {/* <div className="max-w-screen-lg mx-auto my-10"> */}
      <HighchartsReact highcharts={Highcharts} options={chartData} />
    </div>
  )
}

export default Chart
