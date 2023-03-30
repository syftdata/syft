import { SyftEvent } from '../types'
import { BaseEventRow } from './event'
type PanelProps = { events: SyftEvent[] } /* could also use interface */

const Panel = ({ events }: PanelProps) => {
  if (!events) {
    return <></>
  }
  return (
    <div className="flex flex-grow flex-col overflow-y-auto">
      {events.map((event, idx) => {
        return (
          <BaseEventRow key={idx} title={event.name} time={event.createdAt} json={event.props} />
        )
      })}
    </div>
  )
}
export default Panel
