// app.js
App({
  onLaunch() {
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    wx.login({
      success: (res) => {
        console.log("code:", res.code);
      }
    });

    // 环境切换：把 env 改成下面的三个值之一即可
    //   'dev'    → 本机开发（localhost）
    //   'lan'    → 局域网调试（手机和电脑同 WiFi，扫开发者工具预览码）
    //   'tunnel' → 内网穿透（手机走 4G/任意网络扫码，用公网域名访问后端）
    const ENV = 'tunnel'

    this.globalData.env = ENV
    this.globalData.baseUrl = this.globalData.baseUrlMap[ENV]
    // 测试阶段默认 userId
    this.globalData.userId = this.globalData.userId || 'test_user_001'

    this.loadFont()
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

  globalData: {
    userInfo: null,
    env: 'dev',
    baseUrlMap: {
      'dev':    'http://localhost:8080',
      'lan':    'http://192.168.18.62:8080',
      'tunnel': 'http://bba929b3.natappfree.cc'
    },
    baseUrl: 'http://localhost:8080',
    userId: 'test_user_001'
  }
})
