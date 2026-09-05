const app = getApp()

Page({
  data: {
    loading: true,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,   // 1-12
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    // 当月所有日期格 [{ day, current, hasData, amount, dateKey }]
    days: [],
    // 当月每天的支出数据：{ 'YYYY-MM-DD': { amount, items } }
    dailyMap: {},
    todayKey: ''
  },

  onShow() {
    this.buildCalendar()
  },

  onPullDownRefresh() {
    this.buildCalendar()
    setTimeout(() => wx.stopPullDownRefresh(), 500)
  },

  buildCalendar() {
    const today = new Date()
    const todayKey = this.formatKey(today)
    const year = this.data.year
    const month = this.data.month

    // 先用本月已有数据画日历，再异步拉取详情填充金额
    const days = this.computeMonthDays(year, month, today)
    this.setData({ days, todayKey, loading: true })
    this.fetchMonthDetail()
  },

  // 计算某月日历的日期格（包含上下月补位）
  computeMonthDays(year, month, today) {
    const firstDay = new Date(year, month - 1, 1)
    const startWeekday = firstDay.getDay() // 0=Sun
    const lastDay = new Date(year, month, 0).getDate()

    const days = []
    // 上月补位
    for (let i = 0; i < startWeekday; i++) {
      const d = new Date(year, month - 1, -(startWeekday - 1 - i))
      days.push({
        day: d.getDate(),
        dateKey: this.formatKey(d),
        current: false,
        isToday: false
      })
    }
    // 本月
    for (let i = 1; i <= lastDay; i++) {
      const d = new Date(year, month - 1, i)
      const key = this.formatKey(d)
      days.push({
        day: i,
        dateKey: key,
        current: true,
        isToday: key === this.formatKey(today)
      })
    }
    // 下月补位到 6 行
    while (days.length < 42) {
      const last = new Date(days[days.length - 1].dateKey + 'T00:00:00')
      last.setDate(last.getDate() + 1)
      days.push({
        day: last.getDate(),
        dateKey: this.formatKey(last),
        current: false,
        isToday: false
      })
    }
    return days
  },

  fetchMonthDetail() {
    const userId = app.globalData.userId || 'test_user_001'
    const url = app.globalData.baseUrl + '/api/wardrobe/calendar/detail?year=' + this.data.year + '&month=' + this.data.month + '&userId=' + userId
    wx.request({
      url,
      method: 'GET',
      success: (res) => {
        const list = (res.data && res.data.data) || []
        const dailyMap = {}
        list.forEach(item => {
          // 取 finalStart 或 saleStart 作为购买日期
          const dateStr = (item.finalStart || item.saleStart || '').substring(0, 10)
          if (!dateStr) return
          if (!dailyMap[dateStr]) dailyMap[dateStr] = { amount: 0, count: 0, items: [] }
          const amount = Number(item.finalPayment || item.totalPrice || 0)
          dailyMap[dateStr].amount += amount
          dailyMap[dateStr].count += 1
          dailyMap[dateStr].items.push(item)
        })
        // 把金额映射到日期格
        const days = this.data.days.map(d => ({
          ...d,
          amount: dailyMap[d.dateKey] ? dailyMap[d.dateKey].amount : 0,
          hasData: !!dailyMap[d.dateKey]
        }))
        this.setData({ dailyMap, days, loading: false })
      },
      fail: () => {
        wx.showToast({ title: '加载失败', icon: 'none' })
        this.setData({ loading: false })
      }
    })
  },

  // 上一月 / 下一月
  onChangeMonth(e) {
    const delta = e.currentTarget.dataset.delta
    let year = this.data.year
    let month = this.data.month + delta
    if (month < 1) { month = 12; year -= 1 }
    if (month > 12) { month = 1; year += 1 }
    this.setData({ year, month })
    this.buildCalendar()
  },

  // 点击日期 → 进入当日详情
  onTapDay(e) {
    const dateKey = e.currentTarget.dataset.key
    if (!dateKey) return
    wx.navigateTo({
      url: '/pages/calendar-detail/calendar-detail?date=' + dateKey
    })
  },

  // 跳到今天
  onTapToday() {
    const now = new Date()
    this.setData({ year: now.getFullYear(), month: now.getMonth() + 1 })
    this.buildCalendar()
  },

  formatKey(d) {
    const pad = n => n < 10 ? '0' + n : n
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }
})
