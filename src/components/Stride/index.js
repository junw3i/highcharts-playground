import Header from '../common/Header'
import { useSelector } from 'react-redux'

export function Stride() {
  const stride = useSelector(state => state.data.stride)

  return (
    <div className="flex flex-col">
      <Header
        content={{
          title: 'Stride Staking',
          subtitle: 'Redemption Rate',
        }}
      />
      <table className="cell bg-darky-300 text-white">
        <thead>
          <tr>
            <th className="cell text-right">ATOM (21D)</th>
            <th className="cell text-right">OSMO (14D)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="cell text-right">{stride.atom}</td>
            <td className="cell text-right">{stride.osmo}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default Stride
