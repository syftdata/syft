import { useState } from 'react'

const RecordEntryRenderer = ({ keyStr, val }: { keyStr: string; val: any }) => {
  let valString = val
  if (val instanceof Object) {
    valString = JSON.stringify(val, null, 2)
  } else if (val instanceof Date) {
    valString = val.toISOString()
  }
  return (
    <div className="mb-[5px] flex w-full justify-start gap-1 pl-[17px] text-[10px] font-medium">
      <p className="flex-grow text-[#2545c1]">{keyStr}</p>
      <p className="truncate text-[#1c1e27]">{valString}</p>
    </div>
  )
}

const RecordRenderer = ({ data, className }: { data: Record<string, any>; className: string }) => {
  const { createdAt, name, ...rest } = data
  return (
    <div className={className}>
      {Object.entries(rest).map(([key, val]) => (
        <RecordEntryRenderer key={key} keyStr={key} val={val} />
      ))}
    </div>
  )
}

const Chevron = ({ expanded }: { expanded: boolean }) => {
  if (expanded) {
    return (
      <svg
        width={12}
        height={13}
        viewBox="0 0 12 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-3 w-3"
      >
        <path
          d="M9.59992 5.60464C9.59956 5.69784 9.58038 5.79001 9.54353 5.87561C9.50667 5.96121 9.4529 6.03848 9.38544 6.10279L6.61797 8.7734C6.48864 8.90017 6.31476 8.97118 6.13366 8.97118C5.95256 8.97118 5.77868 8.90017 5.64935 8.7734L2.88188 6.00593C2.81737 5.94142 2.7662 5.86483 2.73129 5.78055C2.69637 5.69627 2.67841 5.60593 2.67841 5.5147C2.67841 5.42347 2.69637 5.33313 2.73129 5.24885C2.7662 5.16457 2.81737 5.08798 2.88188 5.02347C2.94639 4.95896 3.02297 4.90779 3.10726 4.87288C3.19154 4.83797 3.28188 4.82 3.37311 4.82C3.46433 4.82 3.55467 4.83797 3.63896 4.87288C3.72324 4.90779 3.79982 4.95896 3.86433 5.02347L6.14058 7.30664L8.42375 5.1065C8.55338 4.97764 8.72873 4.90531 8.91151 4.90531C9.09429 4.90531 9.26965 4.97764 9.39928 5.1065C9.46424 5.17197 9.51545 5.24976 9.5499 5.33531C9.58436 5.42086 9.60137 5.51243 9.59992 5.60464Z"
          fill="#C9CACE"
        />
      </svg>
    )
  } else {
    return (
      <svg
        width={12}
        height={13}
        viewBox="0 0 12 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-3 w-3"
      >
        <path
          d="M5.10464 2.90008C5.19784 2.90044 5.29001 2.91962 5.37561 2.95648C5.46121 2.99333 5.53848 3.0471 5.60279 3.11456L8.2734 5.88204C8.40017 6.01137 8.47118 6.18525 8.47118 6.36634C8.47118 6.54744 8.40017 6.72132 8.2734 6.85065L5.50593 9.61813C5.44142 9.68264 5.36483 9.73381 5.28055 9.76872C5.19627 9.80363 5.10593 9.8216 5.0147 9.8216C4.92347 9.8216 4.83313 9.80363 4.74885 9.76872C4.66457 9.73381 4.58798 9.68264 4.52347 9.61813C4.45896 9.55362 4.40779 9.47703 4.37288 9.39275C4.33797 9.30846 4.32 9.21813 4.32 9.1269C4.32 9.03567 4.33797 8.94533 4.37288 8.86105C4.40779 8.77676 4.45896 8.70018 4.52347 8.63567L6.80664 6.35943L4.6065 4.07626C4.47764 3.94663 4.40531 3.77128 4.40531 3.58849C4.40531 3.40571 4.47764 3.23036 4.6065 3.10073C4.67197 3.03577 4.74976 2.98456 4.83531 2.9501C4.92086 2.91564 5.01243 2.89864 5.10464 2.90008Z"
          fill="#C9CACE"
        />
      </svg>
    )
  }
}

export const BaseEventRow = ({
  title,
  time,
  json,
}: {
  title: string
  time: Date
  json: Record<string, any>
}) => {
  const [expanded, setExpanded] = useState(false)
  const toggleExpanded = () => {
    setExpanded(!expanded)
  }
  return (
    <div className="flex w-full flex-col gap-1 border border-[#e7eaf6] px-1">
      <div className="flex flex-row py-1">
        <div className="flex flex-grow cursor-pointer items-center gap-1" onClick={toggleExpanded}>
          <Chevron expanded={expanded} />
          <p className=" text-left text-[10px] font-medium text-[#1c1e27]">{title}</p>
        </div>
        <div className="text-[10px] font-medium text-[#83848a]">
          {time ? time.toLocaleTimeString('en-US') : ''}
        </div>
      </div>
      <RecordRenderer className={expanded ? '' : 'hidden'} data={json} />
    </div>
  )
}
