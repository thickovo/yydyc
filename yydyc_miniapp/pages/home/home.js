const app = getApp()

Page({
  data: {
    loading: true,
    hasPending: false,
    totalCount: 0,
    pendingCount: 0,
    paidCount: 0,
    pendingList: [],
    scrollText: ''
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
    this.fetchStats()
  },

  fetchStats() {
    const userId = app.globalData.userId || 'test_user_001'
    const today = new Date().toISOString().slice(0, 10)
    this.setData({ loading: true })

    // 1. 真实概览统计
    wx.request({
      url: app.globalData.baseUrl + '/api/wardrobe/statistics/overview?userId=' + userId,
      method: 'GET',
      success: (res) => {
        const data = res.data && res.data.data ? res.data.data : {}
        this.setData({
          totalCount: data.totalCount || 0,
          pendingCount: data.pendingCount || 0,
          paidCount: data.paidCount || 0,
          hasPending: (data.pendingCount || 0) > 0
        })
      },
      fail: () => {
        this.setData({
          totalCount: 0, pendingCount: 0, paidCount: 0, hasPending: false
        })
      }
    })

    // 2. 待补款列表：只筛选"未过期"的待补款（finalStart/saleStart >= today）
    wx.request({
      url: app.globalData.baseUrl + '/api/wardrobe/list?userId=' + userId + '&size=50',
      method: 'GET',
      success: (res) => {
        const records = (res.data && res.data.data && res.data.data.records) || []
        // 只保留 status=0（待补款）的裙子，且 finalStart/saleStart 还没到今天
        const pending = records.filter(item => {
          if (item.status !== 0) return false
          const dueDate = item.finalStart || item.saleStart
          if (!dueDate) return false
          // dueDate 形如 "2026-09-05T..." 或 "2026-09-05"，统一按字符串前 10 位比较
          const dateStr = dueDate.substring(0, 10)
          return dateStr >= today
        })

        let scrollText = ''
        if (pending.length > 0) {
          const names = pending.slice(0, 6).map(item => item.name).join('、')
          scrollText = `⏰ ${names} 距离尾款/预售还有几天，记得补款哦～`
        }

        this.setData({
          pendingList: pending,
          scrollText,
          loading: false
        })
      },
      fail: () => {
        this.setData({ pendingList: [], scrollText: '', loading: false })
      }
    })
  },

  goToCloset() {
    wx.navigateTo({ url: '/pages/list/list' })
  },

  goToWish() {
    wx.navigateTo({ url: '/pages/wish/wish' })
  },

  goToCalendar() {
    wx.navigateTo({ url: '/pages/calendar/calendar' })
  },

  goToAccount() {
    wx.navigateTo({ url: '/pages/account/account' })
  }
})
