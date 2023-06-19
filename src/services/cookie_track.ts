import { getCookie, setCookieExpiredInDay } from '@utils/cookie'
import events, { trackCookieName } from '@constants/analyticEvents'
import trackSvc from './track'
/**
 * 当满足所有cookie 为1时，执行回调
 * @param current 目标cookie
 * @param all 所有cookie
 * @param success 成功回调
 * @param fail 失败回调
 */
export function pageTrackWithCookie(current: string, all: string[], success: () => void) {
  if (getCookie(current) !== '1') {
    setCookieExpiredInDay(current, '1')
  }
  if (all.every(cookie => getCookie(cookie) === '1')) {
    if (getCookie(trackCookieName.bothStatementAndListUploaded) !== '1') {
      success()
      setCookieExpiredInDay(trackCookieName.bothStatementAndListUploaded, '1')
    }
  }
}

export function trackStatementAndTicketListWithCookie(
  page: 'statement_enter' | 'ticket_list_enter'
) {
  pageTrackWithCookie(page, [trackCookieName.statement, trackCookieName.ticketList], () => {
    trackSvc.track(events.bothStatementAndList)
  })
}
