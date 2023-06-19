import common from './common'
import statistics from './statistics'
import ticketDetail from './ticketDetail'
import ticketList from './ticketList'
import statement from './statement'

export default {
  common: {
    ...common,
    ...statistics,
    ...ticketDetail,
    ...ticketList
  },
  statement
}
