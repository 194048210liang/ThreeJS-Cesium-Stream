import request from '@/utils/request'

const API_BASE = 'https://wdzp.ccwu.cc/api/visits'

/** 上报一次页面访问 */
export function reportVisit(page: string, browser: string, device: string) {
  const payload = JSON.stringify({ page, browser, device })
  // text/plain 不触发 preflight，Worker 的 request.json() 仍可解析
  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'text/plain' })
    navigator.sendBeacon(API_BASE, blob)
  } else {
    fetch(API_BASE, {
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'text/plain' },
      keepalive: true,
    }).catch(() => {})
  }
}

/** 获取访客统计数据 */
export function getVisitorStats() {
  return request.get(API_BASE)
}
