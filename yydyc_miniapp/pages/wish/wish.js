const app = getApp()
const { resolveImageUrl } = require('../../utils/upload.js')

Page({
  data: {
    loading: true,
    wishList: [],
    filteredWishList: [],
    keyword: ''
  },

  onShow() {
    app.getUserId().then(() => this.fetchWishes())
  },

  onPullDownRefresh() {
    app.getUserId().then(() => {
      this.fetchWishes()
      setTimeout(() => wx.stopPullDownRefresh(), 500)
    })
  },

  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value })
    this.applyFilter()
  },

  fetchWishes() {
    const userId = app.globalData.userId || 'test_user_001'
    const baseUrl = app.globalData.baseUrl
    this.setData({ loading: true })
    wx.request({
      url: baseUrl + '/api/wish/list?userId=' + userId,
      method: 'GET',
      success: (res) => {
        const list = (res.data && res.data.data) || []
        const formatted = list.map(item => ({
          ...item,
          id: String(item.id),
          displayImageUrl: resolveImageUrl(item.imageUrl, baseUrl),
          isDone: Number(item.isDone || 0) === 1,
          doneTimeText: this.formatTime(item.updateTime || item.createTime)
        }))
        this.setData({ wishList: formatted, filteredWishList: formatted, loading: false })
        this.applyFilter()
      },
      fail: () => {
        wx.showToast({ title: '网络异常', icon: 'none' })
        this.setData({ wishList: [], filteredWishList: [], loading: false })
      }
    })
  },

  applyFilter() {
    const kw = (this.data.keyword || '').toLowerCase().trim()
    let list = this.data.wishList
    if (kw) {
      list = list.filter(item =>
        (item.name && item.name.toLowerCase().indexOf(kw) > -1) ||
        (item.brand && item.brand.toLowerCase().indexOf(kw) > -1)
      )
    }
    this.setData({ filteredWishList: list })
  },

  // 切换心愿完成状态（写后端持久化：已完成/取消完成）
  onToggleDone(e) {
    const id = e.currentTarget.dataset.id
    const target = this.data.wishList.find(x => x.id === id)
    if (!target) return
    const newDone = !target.isDone
    wx.request({
      url: app.globalData.baseUrl + '/api/wish/update',
      method: 'PUT',
      header: { 'Content-Type': 'application/json' },
      data: { id, isDone: newDone ? 1 : 0 },
      success: (res) => {
        if (res.data && res.data.code === 200) {
          app.toast(newDone ? '已完成 ✨' : '已取消', 'success')
          this.fetchWishes()
        } else {
          app.toast(res.data && res.data.msg ? res.data.msg : '操作失败')
        }
      },
      fail: () => app.toast('网络异常')
    })
  },

  // 添加心愿
  onAdd() {
    wx.navigateTo({ url: '/pages/wish-edit/wish-edit' })
  },

  // 编辑心愿
  onTapItem(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/wish-edit/wish-edit?id=' + id })
  },

  // 复制心愿链接到剪贴板
  onCopyLink(e) {
    const link = e.currentTarget.dataset.link
    if (!link) return
    wx.setClipboardData({
      data: link,
      success: () => app.toast('链接已复制', 'success')
    })
  },

  formatTime(timeStr) {
    if (!timeStr) return ''
    // 兼容 "2026-09-05T10:30:00" 和 "2026-09-05 10:30:00"
    const d = new Date(timeStr.replace(' ', 'T'))
    if (isNaN(d.getTime())) return ''
    const pad = n => n < 10 ? '0' + n : n
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
})
