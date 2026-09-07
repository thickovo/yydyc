const app = getApp()
const { resolveImageUrl } = require('../../utils/upload.js')

Page({
  data: {
    date: '',
    dateText: '',
    items: [],
    totalAmount: 0,
    count: 0,
    loading: true
  },

  onLoad(options) {
    const date = options.date || ''
    this.setData({ date })
    app.getUserId().then(() => this.fetchDayDetail(date))
  },

  fetchDayDetail(date) {
    const userId = app.globalData.userId || 'test_user_001'
    const baseUrl = app.globalData.baseUrl
    const [year, month] = date.split('-')
    if (!year || !month) return

    wx.request({
      url: baseUrl + '/api/wardrobe/calendar/detail?year=' + year + '&month=' + parseInt(month, 10) + '&userId=' + userId,
      method: 'GET',
      success: (res) => {
        const list = (res.data && res.data.data) || []
        // 过滤出当天的记录
        const todayList = list.filter(item => {
          const d = (item.finalStart || item.saleStart || '').substring(0, 10)
          return d === date
        })
        const formatted = todayList.map(item => {
          const amount = Number(item.finalPayment || item.totalPrice || 0)
          return {
            ...item,
            amount,
            displayImageUrl: resolveImageUrl(item.imageUrl, baseUrl)
          }
        })
        const totalAmount = formatted.reduce((s, i) => s + i.amount, 0)
        const dateObj = new Date(date + 'T00:00:00')
        const weekday = ['日', '一', '二', '三', '四', '五', '六'][dateObj.getDay()]
        this.setData({
          items: formatted,
          totalAmount,
          count: formatted.length,
          loading: false,
          dateText: `${month}月${date.split('-')[2]}日 · 星期${weekday}`
        })
        wx.setNavigationBarTitle({ title: `${month}月${date.split('-')[2]}日` })
      },
      fail: () => {
        wx.showToast({ title: '加载失败', icon: 'none' })
        this.setData({ loading: false })
      }
    })
  },

  onTapItem(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id })
  }
})
