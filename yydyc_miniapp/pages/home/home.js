const app = getApp()

Page({
  data: {
    hasPending: false,
    totalCount: 0,
    pendingCount: 0,
    paidCount: 0,
    pendingList: [],
    scrollText: ''
  },

  // 在 data: {...} 后面，onShow 前面加这个方法
requestSubscribe() {
  const tmplIds = ['lcVuskPR6XMJg53UENc8_c1NATX0df9o6ZY69cWFz3s']
  wx.requestSubscribeMessage({
    tmplIds: tmplIds,
    success(res) {
      console.log('订阅结果：', res)
      if (res[tmplIds[0]] === 'accept') {
        wx.showToast({ title: '授权成功', icon: 'success' })
      } else {
        wx.showToast({ title: '你拒绝了授权', icon: 'none' })
      }
    },
    fail(err) {
      console.error('订阅失败：', err)
      wx.showToast({ title: '授权失败', icon: 'none' })
    }
  })
},

  onShow() {
    this.fetchStats();
  },

  fetchStats() {
    wx.request({
      url: app.globalData.baseUrl + '/api/wardrobe/list?userId=test_user_001',
      method: 'GET',
      success: (res) => {
        const records = res.data.data.records || [];
        const total = records.length;
        const pending = records.filter(item => item.status === 0);
        const paid = records.filter(item => item.status === 1);

        let scrollText = '';
        if (pending.length > 0) {
          const names = pending.map(item => item.name).join('、');
          scrollText = `⏰ ${names} 距离尾款还有几天，记得补款哦～`;
        }

        this.setData({
          totalCount: total,
          pendingCount: pending.length,
          paidCount: paid.length,
          hasPending: pending.length > 0,
          pendingList: pending,
          scrollText: scrollText
        });
      }
    });
  },

  goToCloset() {
    wx.navigateTo({ url: '/pages/list/list' });
  },

  goToWish() {
    wx.showToast({ title: '心愿单开发中', icon: 'none' });
  },

  goToCalendar() {
    wx.showToast({ title: '尾款日历开发中', icon: 'none' });
  },

  goToAccount() {
    wx.showToast({ title: '裙子小账本开发中', icon: 'none' });
  }
})