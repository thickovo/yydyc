const app = getApp()
const { resolveImageUrl } = require('../../utils/upload.js')

Page({
  data: {
    loading: true,
    keyword: '',
    totalSpent: 0,
    pendingTotal: 0,
    paidTotal: 0,
    totalCount: 0,
    pendingCount: 0,
    paidCount: 0,
    // 月度趋势 [ { month, amount } ] 最近 12 月
    trend: [],
    // 品牌占比 [ { brand, amount, percent } ]
    brandStat: [],
    // 账单列表（按 finalStart/saleStart 倒序）
    bills: []
  },

  onShow() {
    this.fetchAll()
  },

  onPullDownRefresh() {
    this.fetchAll()
    setTimeout(() => wx.stopPullDownRefresh(), 500)
  },

  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value })
    this.applyFilter()
  },

  fetchAll() {
    const userId = app.globalData.userId || 'test_user_001'
    const baseUrl = app.globalData.baseUrl
    this.setData({ loading: true })

    // 1. 概览
    wx.request({
      url: baseUrl + '/api/wardrobe/statistics/overview?userId=' + userId,
      method: 'GET',
      success: (res) => {
        const data = (res.data && res.data.data) || {}
        this.setData({
          totalSpent: Number(data.totalSpent || 0),
          pendingTotal: Number(data.pendingTotal || 0),
          paidTotal: Number(data.paidTotal || 0),
          totalCount: data.totalCount || 0,
          pendingCount: data.pendingCount || 0,
          paidCount: data.paidCount || 0
        })
      }
    })

    // 2. 月度趋势
    wx.request({
      url: baseUrl + '/api/wardrobe/statistics/trend?userId=' + userId,
      method: 'GET',
      success: (res) => {
        const list = (res.data && res.data.data) || []
        // 已经是月度趋势数据（按月份）
        const trend = list.map(t => ({ month: t.month, amount: Number(t.total || 0) }))
        this.setData({ trend })
      }
    })

    // 3. 品牌分类
    wx.request({
      url: baseUrl + '/api/wardrobe/statistics/category?userId=' + userId,
      method: 'GET',
      success: (res) => {
        const list = (res.data && res.data.data) || []
        const total = list.reduce((s, b) => s + Number(b.total || 0), 0)
        const brandStat = list
          .map(b => ({
            brand: b.brand || '未分类',
            amount: Number(b.total || 0),
            percent: total > 0 ? Math.round((Number(b.total) / total) * 100) : 0
          }))
          .sort((a, b) => b.amount - a.amount)
        this.setData({ brandStat })
      }
    })

    // 4. 完整账单（从 list 拿）
    wx.request({
      url: baseUrl + '/api/wardrobe/list?userId=' + userId + '&size=200',
      method: 'GET',
      success: (res) => {
        const records = (res.data && res.data.data && res.data.data.records) || []
        const bills = records
          .map(item => ({
            id: String(item.id),
            name: item.name || '',
            brand: item.brand || '',
            date: (item.finalStart || item.saleStart || '').substring(0, 10),
            amount: Number(item.finalPayment || item.totalPrice || 0),
            type: item.type || '',
            displayImageUrl: resolveImageUrl(item.imageUrl, baseUrl)
          }))
          .filter(b => b.amount > 0 && b.date)
          .sort((a, b) => b.date.localeCompare(a.date))

        this.setData({ bills, allBills: bills, loading: false })
        this.applyFilter()
      },
      fail: () => {
        this.setData({ bills: [], loading: false })
        wx.showToast({ title: '账单加载失败', icon: 'none' })
      }
    })
  },

  applyFilter() {
    const kw = (this.data.keyword || '').toLowerCase().trim()
    const all = this.data.allBills || this.data.bills
    if (!kw) {
      this.setData({ bills: all })
      return
    }
    const filtered = all.filter(b =>
      (b.name && b.name.toLowerCase().indexOf(kw) > -1) ||
      (b.brand && b.brand.toLowerCase().indexOf(kw) > -1)
    )
    this.setData({ bills: filtered })
  },

  onTapBill(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id })
  },

  // 趋势条宽度（百分比）
  trendWidth(amount) {
    if (!this.data.trend || this.data.trend.length === 0) return 0
    const max = Math.max(...this.data.trend.map(t => t.amount || 0))
    if (max === 0) return 0
    return Math.round((amount / max) * 100)
  },

  // 饼图扇区（CSS conic-gradient）
  getPieStyle() {
    const list = this.data.brandStat.slice(0, 6) // 最多显示 6 个
    if (!list || list.length === 0) return 'background: #F5F0F2;'
    const colors = ['#FF6B8A', '#FFB6C1', '#F8BBD0', '#CE93D8', '#9FA8DA', '#80DEEA', '#A5D6A7']
    let total = list.reduce((s, b) => s + b.amount, 0)
    if (total === 0) return 'background: #F5F0F2;'
    let acc = 0
    const stops = list.map((b, i) => {
      const start = (acc / total) * 360
      acc += b.amount
      const end = (acc / total) * 360
      return `${colors[i % colors.length]} ${start}deg ${end}deg`
    })
    return 'background: conic-gradient(' + stops.join(',') + ');'
  }
})
