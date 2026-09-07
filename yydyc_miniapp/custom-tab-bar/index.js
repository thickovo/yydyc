Component({
  data: {
    selected: 0,
    color: '#999999',
    selectedColor: '#E05A86',
    list: [
      { pagePath: '/pages/home/home',   text: '首页', glyph: '⌂', rotations: [0, 72, 144, 216, 288] },
      { pagePath: '/pages/ai/ai',       text: 'AI',   glyph: '✦', rotations: [0, 72, 144, 216, 288] },
      { pagePath: '/pages/mine/mine',   text: '我的', glyph: '♥', rotations: [0, 72, 144, 216, 288] }
    ]
  },
  attached() {
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
      if (index === this.data.selected) return;
      wx.switchTab({ url: this.data.list[index].pagePath });
    }
  }
});
