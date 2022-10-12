import React, { useEffect, useState } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

let options = {
  title: {
    text: 'My chart',
  },
  series: [
    {
      data: [1, 2, 3],
    },
  ],
}

function scrub(d) {
  // [0] unix
  // [1] close
  const scrubbed = []
  for (var i = d.length - 1; i >= 0; i--) {
    scrubbed.push([d[i][0], d[i][4]])
  }
  return scrubbed
}

const Chart = () => {
  const [data, setData] = useState([])

  useEffect(() => {
    fetch('https://api.exchange.coinbase.com/products/ETH-USD/candles?granularity=86400')
      .then(response => response.json())
      .then(d => {
        const srubbedData = scrub(d)
        setData(srubbedData)
      })
  }, [])

  console.log(data)
  options.series[0].data = data

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  )
}

export default Chart
