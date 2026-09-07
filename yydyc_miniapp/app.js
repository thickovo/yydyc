// app.js
App({
  onLaunch() {
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 环境切换：把 env 改成下面的三个值之一即可
    //   'dev'    → 本机开发（localhost）
    //   'lan'    → 局域网调试（手机和电脑同 WiFi，扫开发者工具预览码）
    //   'tunnel' → 内网穿透（手机走 4G/任意网络扫码，用公网域名访问后端）
    const ENV = 'lan'

    this.globalData.env = ENV
    this.globalData.baseUrl = this.globalData.baseUrlMap[ENV]

    this.loadFont()

    // 启动时立刻拿 openid，作为后续所有请求的 userId
    // 必须先 wx.login 拿 code，再把 code 交给后端换 openid
    // 这个流程必须在 onLaunch 里跑，否则 list/wish/account 等页面会一直用默认的 test_user_001
    this.fetchWxOpenid()
  },

  // 异步拉取并缓存 openid；失败时降级到 test_user_001，保证页面不会因为没 userId 崩
  fetchWxOpenid() {
    // 优先用本地缓存（已登录过的用户秒进）
    const cached = wx.getStorageSync('wxOpenid')
    if (cached) {
      this.globalData.userId = cached
      console.log('[app.js] 从 storage 恢复 userId:', cached)
      return
    }
    wx.login({
      success: (res) => {
        if (!res.code) {
          console.warn('[app.js] wx.login 未拿到 code')
          this.globalData.userId = 'test_user_001'
          return
        }
        wx.request({
          url: this.globalData.baseUrl + '/api/login?code=' + res.code,
          method: 'GET',
          success: (resp) => {
            const openid = resp && resp.data && resp.data.data
            if (openid) {
              wx.setStorageSync('wxOpenid', openid)
              this.globalData.userId = openid
              console.log('[app.js] 已获取 userId:', openid)
            } else {
              console.warn('[app.js] /api/login 返回数据异常，降级用 test_user_001', resp)
              this.globalData.userId = 'test_user_001'
            }
          },
          fail: (err) => {
            console.error('[app.js] /api/login 请求失败', err)
            this.globalData.userId = 'test_user_001'
          }
        })
      },
      fail: (err) => {
        console.error('[app.js] wx.login 失败', err)
        this.globalData.userId = 'test_user_001'
      }
    })
  },

  loadFont() {
    const baseUrl = this.globalData.baseUrl || 'http://localhost:8080'
    wx.loadFontFace({
      family: 'youyou',
      source: 'url("' + baseUrl + '/fonts/youyou.ttf")',
      global: true,
      success: function(res) {
        console.log('字体加载成功', res)
      },
      fail: function(err) {
        // 字体加载失败时，app.wxss 中已经配置了系统字体降级，无需任何额外操作
        console.warn('字体加载失败，已降级为系统默认字体', err)
      }
    })
  },

  // 全局 toast 工具
  toast(title, icon = 'none') {
    wx.showToast({ title, icon, duration: 1500 })
  },

  /**
   * 异步获取 userId（带轮询兜底）。
   * app.js onLaunch 已经异步拉过 openid，但用户可能在拉到之前就跳转到 list/wish 等页面，
   * 所以每个页面拿 userId 时调一下这个函数：
   *  - 如果 globalData 已经是真实 openid（不是 test_user_001），立即返回
   *  - 否则从 storage 取；若都没有，最多等 2s 等 fetchWxOpenid 完成
   */
  getUserId() {
    return new Promise((resolve) => {
      const isReal = (uid) => uid && !String(uid).startsWith('test_user')
      if (isReal(this.globalData.userId)) {
        resolve(this.globalData.userId)
        return
      }
      const cached = wx.getStorageSync('wxOpenid')
      if (isReal(cached)) {
        this.globalData.userId = cached
        resolve(cached)
        return
      }
      // 等 fetchWxOpenid 异步跑完，最多 2 秒（每 100ms 检一次）
      let attempts = 0
      const tick = () => {
        if (isReal(this.globalData.userId)) {
          resolve(this.globalData.userId)
          return
        }
        if (attempts++ >= 20) {
          // 超时兜底，用 test_user_001 返回，保证业务不卡死
          resolve(this.globalData.userId || 'test_user_001')
          return
        }
        setTimeout(tick, 100)
      }
      tick()
    })
  },

  globalData: {
    userInfo: null,
    env: 'dev',
    baseUrlMap: {
      'dev':    'http://localhost:8080',
      'lan':    'http://192.168.18.62:8080',
      'tunnel': 'http://ad4ac6ec.natappfree.cc'
    },
    baseUrl: 'http://localhost:8080',
    userId: 'test_user_001'
  }
})
