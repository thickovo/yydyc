const app = getApp()
const { resolveImageUrl } = require('../../utils/upload.js')

Page({
  data: {
    skirts: [],
    filteredSkirts: [],
    today: '',
    keyword: '',
    category: '',
    type: '',
    color: '',
    status: '',
    categoryOptions: ['全部', '裙子', '袜子', '鞋', '配饰', '其他'],
    typeOptions: ['全部', 'JSK', 'OP', 'SK', '衬衫', '外套', '背带裙', '其他'],
    colorOptions: ['全部', '#FFB6C1', '#FFFFFF', '#2C2C2C', '#E8455A', '#3B4A5E', '#9B59B6', '#2ECC71'],
    colorLabels: ['全部', '粉色', '白色', '黑色', '红色', '蓝色', '紫色', '绿色'],
    statusOptions: ['全部', '今日', '待补款', '已结清'],
    statusKeys: ['', 'today', 'pending', 'paid'],
    showFilter: false,
    allSkirts: []
  },

  onShow() {
    const todayStr = new Date().toISOString().slice(0, 10);
    this.setData({ today: todayStr });
    this.fetchSkirts();
  },

  onPullDownRefresh() {
    this.fetchSkirts();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 500);
  },

  fetchSkirts() {
    const todayStr = this.data.today;
    const baseUrl = app.globalData.baseUrl;
    wx.request({
      url: baseUrl + '/api/wardrobe/list?userId=test_user_001',
      method: 'GET',
      success: (res) => {
        const records = res.data.data.records || [];
        const formatted = records.map(item => {
          const isPresale = !!item.saleStart && (item.deposit === 0 || !item.deposit) && (item.finalPayment === 0 || !item.finalPayment);
          const statusDate = isPresale ? item.saleStart : item.finalStart;
          let statusText = '待补款';
          let statusClass = 'pending';

          if (statusDate) {
            if (statusDate < todayStr) {
              statusText = isPresale ? '已过预售' : '已补款';
              statusClass = 'paid';
            } else if (statusDate === todayStr) {
              statusText = isPresale ? '今日预售' : '今日补款';
              statusClass = 'today';
            } else {
              statusText = isPresale ? '待预售' : '待补款';
              statusClass = 'pending';
            }
          }

          return {
            ...item,
            id: String(item.id),
            statusDate: statusDate,
            statusText: statusText,
            statusClass: statusClass,
            isPresale: isPresale,
            // 兼容老数据（绝对 URL / localhost）和新数据（相对路径），
            // 统一归一成当前 baseUrl 下可加载的完整 URL
            displayImageUrl: resolveImageUrl(item.imageUrl, baseUrl)
          };
        });

        this.setData({ allSkirts: formatted });
        this.applyFilter();
      },
      fail: (err) => {
        console.error('列表请求失败', err);
      }
    });
  },

  applyFilter() {
    let list = [...this.data.allSkirts];
    const { keyword, category, type, color, status } = this.data;

    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(item =>
        (item.name && item.name.toLowerCase().indexOf(kw) > -1) ||
        (item.brand && item.brand.toLowerCase().indexOf(kw) > -1)
      );
    }

    if (category) {
      list = list.filter(item => item.category === category);
    }

    if (type) {
      list = list.filter(item => item.type === type);
    }

    if (color) {
      list = list.filter(item => item.color === color);
    }

    if (status) {
      list = list.filter(item => item.statusClass === status);
    }

    const sorted = list.sort((a, b) => {
      const getPriority = (item) => {
        if (!item.statusDate) return 3;
        if (item.statusClass === 'today') return 0;
        if (item.statusClass === 'pending') return 1;
        if (item.statusClass === 'paid') return 2;
        return 3;
      };
      const pa = getPriority(a);
      const pb = getPriority(b);
      if (pa !== pb) return pa - pb;
      if (a.statusDate && b.statusDate) {
        return a.statusDate < b.statusDate ? -1 : 1;
      }
      return 0;
    });

    this.setData({ filteredSkirts: sorted });
  },

  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value });
    this.applyFilter();
  },

  onCategoryChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({ category: idx === 0 ? '' : this.data.categoryOptions[idx] });
    this.applyFilter();
  },

  onTypeChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({ type: idx === 0 ? '' : this.data.typeOptions[idx] });
    this.applyFilter();
  },

  onColorChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({ color: idx === 0 ? '' : this.data.colorOptions[idx] });
    this.applyFilter();
  },

  onStatusChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({ status: this.data.statusKeys[idx] || '' });
    this.applyFilter();
  },

  clearFilter() {
    this.setData({
      keyword: '',
      category: '',
      type: '',
      color: '',
      status: ''
    });
    this.applyFilter();
  },

  toggleFilter() {
    this.setData({ showFilter: !this.data.showFilter });
  },

  goToAdd() {
    wx.navigateTo({ url: '/pages/add/add' });
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  }
})
