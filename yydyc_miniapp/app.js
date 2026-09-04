// app.js
App({
  onLaunch() {
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    wx.login({
      success: (res) => {
        console.log("code:", res.code);
        // 如果有后端登录接口，调登录接口
      }
    });

    wx.login({
      success: res => {}
    })

    // 环境切换：把 env 改成下面的三个值之一即可
    //   'dev'    → 本机开发（localhost）
    //   'lan'    → 局域网调试（手机和电脑同 WiFi，扫开发者工具预览码）
    //   'tunnel' → 内网穿透（手机走 4G/任意网络扫码，用公网域名访问后端）
    const ENV = 'tunnel'  // ← 改这里切换环境

    this.globalData.env = ENV
    this.globalData.baseUrl = this.globalData.baseUrlMap[ENV]

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
        console.warn('字体加载失败，使用备用字体', err)
      }
    })
  },

  globalData: {
    userInfo: null,
    // 当前环境（onLaunch 会按这个值选 baseUrl）
    env: 'dev',
    // 三种环境的 baseUrl 映射
    baseUrlMap: {
      'dev':    'http://localhost:8080',
      'lan':    'http://192.168.18.62:8080',
      'tunnel': 'http://bba929b3.natappfree.cc'
    },
    // 当前生效的 baseUrl（默认值，onLaunch 会重算）
    baseUrl: 'http://localhost:8080'
  }
})
