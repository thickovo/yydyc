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
    app.getUserId().then(() => this.fetchStats())
  },

  fetchStats() {
    const userId = app.globalData.userId || 'test_user_001'
    const now = new Date()
    const pad = (n) => (n < 10 ? '0' + n : n)
    const today = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate())
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

    // 2. 待补款列表：只拉 status=0（待补款）的裙子，再按 finalStart/saleStart >= today 过滤
    // 后端 list 接口支持 status 参数，避免前端拿全量再过滤浪费流量
    wx.request({
      url: app.globalData.baseUrl + '/api/wardrobe/list?userId=' + userId + '&status=0&size=50',
      method: 'GET',
      success: (res) => {
        const records = (res.data && res.data.data && res.data.data.records) || []
        // 后端已按 status=0 过滤；前端再保险一次：只保留 finalStart/saleStart >= today 的项
        const pending = records.filter(item => {
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
  },

  goMore() {
    wx.showModal({
      title: '更多功能',
      content: '更多功能正在赶来的路上，敬请期待～ ♪',
      showCancel: false,
      confirmText: '知道啦',
      confirmColor: '#E05A86'
    })
  }
})
