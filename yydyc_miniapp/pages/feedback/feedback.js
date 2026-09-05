const app = getApp()

Page({
  data: {
    content: '',
    contact: '',
    submitting: false
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value })
  },

  onContactInput(e) {
    this.setData({ contact: e.detail.value })
  },

  onSubmit() {
    const content = this.data.content.trim()
    if (!content) {
      app.toast('请填写反馈内容')
      return
    }
    this.setData({ submitting: true })
    wx.request({
      url: app.globalData.baseUrl + '/api/admin/feedback',
      method: 'POST',
      data: {
        userId: app.globalData.userId,
        content,
        contact: this.data.contact.trim()
      },
      success: (res) => {
        this.setData({ submitting: false })
        if (res.data && res.data.code === 200) {
          app.toast('反馈已提交 ✨', 'success')
          setTimeout(() => wx.navigateBack(), 1200)
        } else {
          app.toast(res.data && res.data.msg ? res.data.msg : '提交失败')
        }
      },
      fail: () => {
        this.setData({ submitting: false })
        app.toast('网络异常')
      }
    })
  }
})
