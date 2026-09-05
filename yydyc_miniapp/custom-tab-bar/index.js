Component({
  data: {
    selected: 0,
    color: '#999999',
    selectedColor: '#FF6B8A',
    list: [
      { pagePath: '/pages/home/home', text: '首页', icon: '🏠' },
      { pagePath: '/pages/ai/ai', text: 'AI', icon: '💬' },
      { pagePath: '/pages/mine/mine', text: '我的', icon: '👤' }
    ]
  },
  attached() {
    // 首次进入时根据当前页面设置 selected
    const pages = getCurrentPages();
    if (pages.length > 0) {
      const cur = '/' + pages[pages.length - 1].route;
      const idx = this.data.list.findIndex(item => item.pagePath === cur);
      if (idx >= 0) {
        this.setData({ selected: idx });
      }
    }
  },
  methods: {
    onSwitch(e) {
      const index = e.currentTarget.dataset.index;
      const item = this.data.list[index];
      if (index === this.data.selected) {
        return;
      }
      const url = item.pagePath;
      // tabBar 页面用 switchTab，其它用 navigateTo
      wx.switchTab({ url });
    }
  }
});
