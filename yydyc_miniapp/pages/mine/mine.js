const app = getApp()

Page({
  data: {
    nickname: '',
    userId: '',
    avatarUrl: '',
    notifyEnabled: false,
    showAbout: false,
    showContact: false,
    wechat: 'paceMak1r_17',
    email: 'thickovo@yeah.net'
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
    const notifyEnabled = wx.getStorageSync('notifyEnabled') || false
    const cachedNick = wx.getStorageSync('wxNickname') || ''
    const cachedAvatar = wx.getStorageSync('wxAvatar') || ''
    this.setData({
      notifyEnabled,
      nickname: cachedNick,
      avatarUrl: cachedAvatar,
      userId: app.globalData.userId || 'test_user_001'
    })
    this.fetchWxIdentity()
  },

  fetchWxIdentity() {
    const cached = wx.getStorageSync('wxOpenid')
    if (cached) {
      app.globalData.userId = cached
      this.setData({ userId: cached })
      return
    }
    wx.login({
      success: (res) => {
        if (!res.code) return
        wx.request({
          url: app.globalData.baseUrl + '/api/login?code=' + res.code,
          method: 'GET',
          success: (resp) => {
            const openid = resp.data && resp.data.data
            if (openid) {
              wx.setStorageSync('wxOpenid', openid)
              app.globalData.userId = openid
              this.setData({ userId: openid })
            }
          }
        })
      }
    })
  },

  onTapProfile() {
    wx.getUserProfile({
      desc: '用于展示你的昵称和头像',
      success: (res) => {
        const { nickName, avatarUrl } = res.userInfo
        wx.setStorageSync('wxNickname', nickName)
        wx.setStorageSync('wxAvatar', avatarUrl)
        this.setData({ nickname: nickName, avatarUrl })
        app.toast('已更新个人信息', 'success')
      }
    })
  },

  onNotifyChange(e) {
    const enabled = e.detail.value
    this.setData({ notifyEnabled: enabled })
    wx.setStorageSync('notifyEnabled', enabled)
    app.toast(enabled ? '已开启消息提醒' : '已关闭消息提醒')
  },

  onExport() {
    const userId = app.globalData.userId
    wx.showLoading({ title: '导出中...' })
    wx.request({
      url: app.globalData.baseUrl + '/api/backup/export?userId=' + userId,
      method: 'GET',
      success: (res) => {
        wx.hideLoading()
        const json = res.data && res.data.data
        if (!json) {
          app.toast('导出失败')
          return
        }
        const fs = wx.getFileSystemManager()
        const filePath = `${wx.env.USER_DATA_PATH}/yydyc_backup_${Date.now()}.json`
        fs.writeFile({
          filePath,
          data: json,
          encoding: 'utf8',
          success: () => {
            wx.showModal({
              title: '导出成功',
              content: '备份文件已保存，可在小程序文件目录查看',
              showCancel: false
            })
          },
          fail: () => app.toast('保存失败')
        })
      },
      fail: () => {
        wx.hideLoading()
        app.toast('导出失败')
      }
    })
  },

  onImport() {
    const userId = app.globalData.userId
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: (res) => {
        const path = res.tempFiles[0].path
        wx.showLoading({ title: '导入中...' })
        wx.uploadFile({
          url: app.globalData.baseUrl + '/api/backup/import?userId=' + userId,
          filePath: path,
          name: 'file',
          success: () => {
            wx.hideLoading()
            app.toast('导入成功 ✨', 'success')
          },
          fail: () => {
            wx.hideLoading()
            app.toast('导入失败')
          }
        })
      }
    })
  },

  onFeedback() {
    wx.navigateTo({ url: '/pages/feedback/feedback' })
  },

  onAbout() {
    this.setData({ showAbout: true })
  },

  onCloseAbout() {
    this.setData({ showAbout: false })
  },

  onContact() {
    this.setData({ showContact: true })
  },

  onCloseContact() {
    this.setData({ showContact: false })
  },

  onCopyWechat() {
    wx.setClipboardData({
      data: this.data.wechat,
      success: () => app.toast('微信号已复制', 'success')
    })
  },

  onCopyEmail() {
    wx.setClipboardData({
      data: this.data.email,
      success: () => app.toast('邮箱已复制', 'success')
    })
  },

  noop() {}
})
