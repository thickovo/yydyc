const app = getApp()
const { resolveImageUrl } = require('../../utils/upload.js')

Page({
  data: {
    loading: true,
    wishList: [],
    keyword: ''
  },

  onShow() {
    this.fetchWishes()
  },

  onPullDownRefresh() {
    this.fetchWishes()
    setTimeout(() => wx.stopPullDownRefresh(), 500)
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
        this.setData({ wishList: formatted, loading: false })
        this.applyFilter()
      },
      fail: () => {
        wx.showToast({ title: '网络异常', icon: 'none' })
        this.setData({ wishList: [], loading: false })
      }
    })
  },

  applyFilter() {
    // 仅用于 keyword 过滤（数据已在 fetchWishes 时格式化）
    const keyword = (this.data.keyword || '').toLowerCase().trim()
    if (!keyword) return
    // 这里只是标记 filtered view，不修改 wishList 本身
    // 简化处理：直接在 wxml 中通过 wx:if 控制
  },

  // 切换心愿完成状态
  onToggleDone(e) {
    const id = e.currentTarget.dataset.id
    const url = app.globalData.baseUrl + '/api/wish/done/' + id
    wx.request({
      url,
      method: 'PUT',
      success: (res) => {
        if (res.data && res.data.code === 200) {
          // 本地更新状态
          const list = this.data.wishList.map(item => {
            if (item.id === id) {
              const newDone = !item.isDone
              return {
                ...item,
                isDone: newDone,
                doneTimeText: newDone ? this.formatTime(new Date().toISOString()) : item.doneTimeText
              }
            }
            return item
          })
          this.setData({ wishList: list })
          app.toast(res.data.data === '已完成' || this.data.wishList.find(x => x.id === id)?.isDone ? '已完成 ✨' : '已取消', 'success')
          // 简化：服务端返回的可能只是 ok，重新拉取一次更稳
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

  formatTime(timeStr) {
    if (!timeStr) return ''
    // 兼容 "2026-09-05T10:30:00" 和 "2026-09-05 10:30:00"
    const d = new Date(timeStr.replace(' ', 'T'))
    if (isNaN(d.getTime())) return ''
    const pad = n => n < 10 ? '0' + n : n
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
})
