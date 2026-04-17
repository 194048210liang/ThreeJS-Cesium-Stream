/**
 * OpenSky Network API — 全球 ADS-B 实时航班数据
 * 免费无需注册，通过 Vite proxy 代理解决 CORS
 * 匿名用户限速 10 次/秒
 *
 * 文档: https://openskynetwork.github.io/opensky-api/
 */

export interface FlightState {
  icao24: string
  callsign: string
  longitude: number
  latitude: number
  altitude: number // 米
  velocity: number // m/s
  heading: number // 度
  country: string
}

// 中国空域边界 (约)
const CHINA_BOUNDS = { latMin: 17, latMax: 55, lonMin: 72, lonMax: 136 }

// 主要机场坐标 (用于查找最近机场名称)
const AIRPORTS: [string, [number, number]][] = [
  ['北京首都', [116.58, 40.08]],
  ['北京大兴', [116.60, 39.51]],
  ['上海虹桥', [121.34, 31.14]],
  ['上海浦东', [121.81, 31.14]],
  ['广州白云', [113.30, 23.39]],
  ['成都天府', [104.00, 30.57]],
  ['成都双流', [103.95, 30.58]],
  ['深圳宝安', [113.81, 22.64]],
  ['昆明长水', [102.93, 25.10]],
  ['西安咸阳', [108.75, 34.44]],
  ['重庆江北', [106.64, 29.72]],
  ['杭州萧山', [120.43, 30.32]],
  ['武汉天河', [114.21, 30.78]],
  ['南京禄口', [118.86, 31.74]],
  ['厦门高崎', [118.13, 24.54]],
  ['青岛胶东', [120.38, 36.27]],
  ['大连周水子', [121.54, 38.97]],
  ['哈尔滨太平', [126.25, 45.62]],
  ['乌鲁木齐地窝堡', [87.47, 43.91]],
  ['三亚凤凰', [109.42, 18.30]],
  ['贵阳龙洞堡', [106.80, 26.54]],
  ['福州长乐', [119.66, 25.93]],
  ['天津滨海', [117.35, 39.12]],
  ['沈阳桃仙', [123.48, 41.64]],
  ['济南遥墙', [117.22, 36.86]],
  ['南宁吴圩', [108.17, 22.61]],
  ['海口美兰', [110.44, 19.93]],
  ['兰州中川', [103.62, 36.52]],
  ['呼和浩特白塔', [111.82, 40.85]],
  ['郑州新郑', [113.84, 34.52]],
  ['长沙黄花', [113.22, 28.19]],
  ['拉萨贡嘎', [91.10, 29.30]],
  ['银川河东', [106.39, 38.51]],
  ['西宁曹家堡', [102.05, 36.54]],
  ['珠海金湾', [113.23, 22.01]],
  ['宁波栎社', [121.46, 29.83]],
  ['合肥新桥', [117.05, 31.78]],
  ['石家庄正定', [114.70, 38.28]],
  ['太原武宿', [112.63, 37.75]],
  ['南昌昌北', [115.90, 28.86]],
  ['温州龙湾', [120.85, 27.92]],
  ['烟台蓬莱', [120.97, 37.66]],
  ['长春龙嘉', [125.69, 43.90]],
  ['丽江三义', [100.23, 26.54]],
  ['版纳嘎洒', [100.76, 22.31]],
]

/** 根据经纬度查找最近的主要机场名称 */
export function findNearestAirport(lat: number, lon: number): string {
  let minDist = Infinity
  let nearest = '未知空域'
  for (const [name, [aLon, aLat]] of AIRPORTS) {
    const d = (lat - aLat) ** 2 + (lon - aLon) ** 2
    if (d < minDist) {
      minDist = d
      nearest = name
    }
  }
  return nearest
}

/** ICAO 呼号前缀 → 航司中文名 */
export function getAirlineName(callsign: string): string {
  const p = callsign.substring(0, 3).toUpperCase()
  const map: Record<string, string> = {
    CCA: '国航',
    CES: '东航',
    CSN: '南航',
    CQH: '川航',
    CSZ: '深圳航空',
    CBJ: '北京航空',
    CUA: '联合航空',
    EPA: '翡翠货运',
    HXA: '华夏航空',
    GCR: '鲲鹏航空',
    OKA: '奥凯航空',
    CZH: '祥鹏航空',
    UEA: '中国联航',
    KNA: '大新华',
    YCR: '圆通货运',
    CKK: '中国货运',
    CYN: '邮政航空',
    CSC: '顺丰航空',
    DKH: '奥凯航空',
    CBK: '中航货运',
    CFR: '法航',
    AFR: '法航',
    KAL: '大韩航空',
    KLM: '荷航',
    SIA: '新航',
    SQC: '新航货运',
    ANA: '全日空',
    DAL: '达美航空',
    AAL: '美航',
    UAL: '美联航',
    THA: '泰航',
    CPA: '国泰',
    HDA: '香港航空',
    AIC: '印度航空',
    SIA: '新航',
    JAL: '日航',
    RBA: '文莱航空',
    BA: '英航',
  }
  return map[p] || callsign.substring(0, 2)
}

/** 获取中国空域内实时航班数据 */
export async function fetchChinaFlights(): Promise<{
  flights: FlightState[]
  total: number
}> {
  const resp = await fetch('/opensky/api/states/all')
  if (!resp.ok) throw new Error(`OpenSky API: ${resp.status}`)
  const data = await resp.json()

  const flights: FlightState[] = []
  for (const vec of (data.states || []) as any[][]) {
    const callsign = vec[1]?.trim()
    if (!callsign) continue

    const lat: number | null = vec[6]
    const lon: number | null = vec[5]
    if (lat == null || lon == null) continue
    if (vec[8]) continue // 地面

    if (
      lat >= CHINA_BOUNDS.latMin &&
      lat <= CHINA_BOUNDS.latMax &&
      lon >= CHINA_BOUNDS.lonMin &&
      lon <= CHINA_BOUNDS.lonMax
    ) {
      flights.push({
        icao24: vec[0],
        callsign,
        longitude: lon,
        latitude: lat,
        altitude: vec[7] ?? vec[13] ?? 0,
        velocity: vec[9] ?? 0,
        heading: vec[10] ?? 0,
        country: vec[2],
      })
    }
  }

  return { flights, total: flights.length }
}
