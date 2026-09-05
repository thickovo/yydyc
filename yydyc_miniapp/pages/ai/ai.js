const app = getApp()

Page({
  data: {
    messages: [],          // { role: 'user' | 'ai', content, time }
    inputText: '',
    sending: false,
    scrollTop: 0
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value })
  },

  scrollToBottom() {
    this.setData({ scrollTop: 99999 })
  },

  onSend() {
    const text = this.data.inputText.trim()
    if (!text) {
      app.toast('说点什么吧')
      return
    }
    if (this.data.sending) return

    const now = this.formatTime(new Date())
    const userMsg = { role: 'user', content: text, time: now }
    const messages = [...this.data.messages, userMsg]

    this.setData({
      messages,
      inputText: '',
      sending: true
    })
    this.scrollToBottom()

    wx.request({
      url: app.globalData.baseUrl + '/api/ai/chat',
      method: 'POST',
      data: {
        question: text,
        userId: app.globalData.userId || 'test_user_001'
      },
      success: (res) => {
        const answer = (res.data && res.data.data) || '抱歉，我没有理解你的问题'
        const aiMsg = { role: 'ai', content: answer, time: this.formatTime(new Date()) }
        this.setData({
          messages: [...this.data.messages, aiMsg],
          sending: false
        })
        this.scrollToBottom()
      },
      fail: () => {
        const aiMsg = { role: 'ai', content: '网络异常，请稍后再试', time: this.formatTime(new Date()) }
        this.setData({
          messages: [...this.data.messages, aiMsg],
          sending: false
        })
        this.scrollToBottom()
      }
    })
  },

  formatTime(date) {
    const h = date.getHours().toString().padStart(2, '0')
    const m = date.getMinutes().toString().padStart(2, '0')
    return `${h}:${m}`
  }
})
