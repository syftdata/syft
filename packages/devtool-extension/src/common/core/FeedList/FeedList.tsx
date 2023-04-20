import React from 'react'
import SyftTable from '../Table/SyftTable'
import type { FeedListConfig } from './config'
import { FeedListColumns } from './config'

interface FeedListProps {
  data: FeedListConfig[]
}

const FeedList = ({ data }: FeedListProps) => {
  return <SyftTable showHeader={false} columns={FeedListColumns} data={data} />
}

export default FeedList
