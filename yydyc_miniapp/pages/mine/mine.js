const app = getApp()

// 订阅消息模板 ID（用于"待补款提醒"推送）
const SUBSCRIBE_TEMPLATE_ID = 'lcVuskPR6XMJg53UENc8_c1NATX0df9o6ZY69cWFz3s'

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
    // 从本地 storage 恢复开关状态：必须严格判 boolean，否则缓存了 undefined 会被当成 false
    const stored = wx.getStorageSync('notifyEnabled')
    const notifyEnabled = stored === true
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
      },
      fail: () => {
        app.toast('已取消授权')
      }
    })
  },

  // 弹性开关：点击切换消息提醒
  // 开启时必须先拿到用户对订阅消息的授权（wx.requestSubscribeMessage），
  // 用户允许后才持久化"开启"状态；拒绝则保持关闭。
  onToggleNotify() {
    const next = !this.data.notifyEnabled
    if (!next) {
      // 关闭不需要授权，直接存
      this.setData({ notifyEnabled: false })
      wx.setStorageSync('notifyEnabled', false)
      app.toast('已关闭消息提醒')
      return
    }
    // 开启：调订阅授权弹窗
    wx.requestSubscribeMessage({
      tmplIds: [SUBSCRIBE_TEMPLATE_ID],
      success: (res) => {
        // res = { [templateId]: 'accept' | 'reject' | 'ban' }
        const result = res[SUBSCRIBE_TEMPLATE_ID]
        if (result === 'accept') {
          this.setData({ notifyEnabled: true })
          wx.setStorageSync('notifyEnabled', true)
          app.toast('已开启消息提醒 ✨', 'success')
        } else if (result === 'ban') {
          // 被后台封禁，需要用户去设置打开
          this.setData({ notifyEnabled: false })
          wx.setStorageSync('notifyEnabled', false)
          wx.showModal({
            title: '订阅被关闭',
            content: '订阅消息被系统关闭，请前往设置打开"订阅消息"权限后再试',
            showCancel: false,
            confirmText: '我知道了',
            confirmColor: '#E05A86'
          })
        } else {
          // reject
          this.setData({ notifyEnabled: false })
          wx.setStorageSync('notifyEnabled', false)
          app.toast('需要您授权才能收到提醒哦')
        }
      },
      fail: (err) => {
        // 用户取消弹窗 / 权限异常
        this.setData({ notifyEnabled: false })
        wx.setStorageSync('notifyEnabled', false)
        console.warn('[onToggleNotify] requestSubscribeMessage fail', err)
        app.toast('需要您授权才能收到提醒哦')
      }
    })
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
        // 用户取消选择时 tempFiles 为空，需要兜底
        if (!res.tempFiles || res.tempFiles.length === 0) {
          app.toast('未选择文件')
          return
        }
        const path = res.tempFiles[0].path
        wx.showLoading({ title: '导入中...' })
        wx.uploadFile({
          url: app.globalData.baseUrl + '/api/backup/import?userId=' + userId,
          filePath: path,
          name: 'file',
          success: (uploadRes) => {
            wx.hideLoading()
            // 后端可能返回业务错误，解析一下
            let payload = uploadRes.data
            if (typeof payload === 'string') {
              try { payload = JSON.parse(payload) } catch (e) {}
            }
            if (payload && payload.code === 200) {
              app.toast('导入成功 ✨', 'success')
            } else {
              app.toast((payload && payload.msg) || '导入失败')
            }
          },
          fail: () => {
            wx.hideLoading()
            app.toast('导入失败')
          }
        })
      },
      fail: () => {
        // 用户取消选文件
        app.toast('已取消')
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
