Page({
  onLoad() {
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/home/home'
      });
    }, 2000);
  }
})
