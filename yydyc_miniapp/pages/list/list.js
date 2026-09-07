const app = getApp()
const { resolveImageUrl } = require('../../utils/upload.js')

Page({
  data: {
    loading: true,
    skirts: [],
    filteredSkirts: [],
    today: '',
    keyword: '',
    category: '',
    type: '',
    color: '',
    colorIndex: 0,
    colorLabel: '',
    status: '',
    statusIndex: 0,
    statusLabel: '',
    categoryOptions: ['全部', '裙子', '袜子', '鞋', '配饰', '其他'],
    typeOptions: ['全部', 'JSK', 'OP', 'SK', '衬衫', '外套', '背带裙', '其他'],
    colorOptions: ['全部', '#FFB6C1', '#FFFFFF', '#2C2C2C', '#E8455A', '#3B4A5E', '#9B59B6', '#2ECC71'],
    colorLabels: ['全部', '粉色', '白色', '黑色', '红色', '蓝色', '紫色', '绿色'],
    statusOptions: ['全部', '今日', '待补款', '已结清'],
    statusKeys: ['', 'today', 'pending', 'paid'],
    // 柜子分类
    cabinets: [],
    cabinetOptions: ['全部'],
    cabinetIds: [''],
    cabinetIndex: 0,
    cabinetId: '',
    showCabinetManage: false,
    cabinetName: '',
    showFilter: false,
    allSkirts: []
  },

  onShow() {
    const now = new Date();
    const pad = (n) => (n < 10 ? '0' + n : n);
    const todayStr = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
    this.setData({ today: todayStr });
    // 等 app.getUserId 准备好再请求，避免拿到错的 userId 导致列表为空
    app.getUserId().then(() => {
      this.fetchSkirts();
      this.fetchCabinets();
    });
  },

  onPullDownRefresh() {
    app.getUserId().then(() => {
      this.fetchSkirts();
      this.fetchCabinets();
      setTimeout(() => {
        wx.stopPullDownRefresh();
      }, 500);
    });
  },

  fetchSkirts() {
    const todayStr = this.data.today;
    const baseUrl = app.globalData.baseUrl;
    const userId = app.globalData.userId || 'test_user_001';
    this.setData({ loading: true });
    wx.request({
      url: baseUrl + '/api/wardrobe/list?userId=' + userId + '&size=200',
      method: 'GET',
      success: (res) => {
        const records = (res.data && res.data.data && res.data.data.records) || [];
        const formatted = records.map(item => {
          const deposit = Number(item.deposit) || 0
          const finalPayment = Number(item.finalPayment) || 0
          const totalPrice = Number(item.totalPrice) || 0
          const hasSaleStart = !!item.saleStart
          const hasFinalStart = !!item.finalStart
          // 全款现货：有总价、定金/尾款都为 0、无 finalStart/saleStart
          const isStock = !hasSaleStart && !hasFinalStart && totalPrice > 0 && deposit === 0 && finalPayment === 0
          // 全款预售：有 saleStart，且定金/尾款都为 0
          const isPresale = hasSaleStart && deposit === 0 && finalPayment === 0 && !isStock
          // 后端返回 "yyyy-MM-dd HH:mm:ss"，比较前截断成日期，避免含时间导致「今日」永远不命中
          const rawStatusDate = (isPresale ? item.saleStart : item.finalStart) || '';
          const statusDate = rawStatusDate ? String(rawStatusDate).substring(0, 10) : '';
          let statusText = '待补款';
          let statusClass = 'pending';

          if (isStock) {
            statusText = '现货'
            statusClass = 'stock'
          } else if (statusDate) {
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
            isStock: isStock,
            // 兼容老数据（绝对 URL / localhost）和新数据（相对路径），
            // 统一归一成当前 baseUrl 下可加载的完整 URL
            displayImageUrl: resolveImageUrl(item.imageUrl, baseUrl)
          };
        });

        this.setData({ allSkirts: formatted, loading: false });
        this.applyFilter();
      },
      fail: (err) => {
        console.error('列表请求失败', err);
        wx.showToast({ title: '网络异常，请稍后再试', icon: 'none' });
        this.setData({ allSkirts: [], loading: false });
        this.applyFilter();
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

    if (this.data.cabinetId) {
      list = list.filter(item => String(item.cabinetId || '') === String(this.data.cabinetId));
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
    this.setData({
      color: idx === 0 ? '' : this.data.colorOptions[idx],
      colorIndex: idx,
      colorLabel: idx === 0 ? '' : this.data.colorLabels[idx]
    });
    this.applyFilter();
  },

  onStatusChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({
      status: this.data.statusKeys[idx] || '',
      statusIndex: idx,
      statusLabel: this.data.statusOptions[idx] || ''
    });
    this.applyFilter();
  },

  clearFilter() {
    this.setData({
      keyword: '',
      category: '',
      type: '',
      color: '',
      status: '',
      colorIndex: 0,
      colorLabel: '',
      statusIndex: 0,
      statusLabel: ''
    });
    this.applyFilter();
  },

  toggleFilter() {
    this.setData({ showFilter: !this.data.showFilter });
  },

  // ===== 柜子分类 =====
  fetchCabinets() {
    const userId = app.globalData.userId || 'test_user_001';
    wx.request({
      url: app.globalData.baseUrl + '/api/cabinet/list?userId=' + userId,
      method: 'GET',
      success: (res) => {
        const list = (res.data && res.data.data) || [];
        const cabinets = list.map(c => ({ id: String(c.id), name: c.name || '未命名' }));
        const options = ['全部'].concat(cabinets.map(c => c.name));
        const ids = [''].concat(cabinets.map(c => c.id));
        // 如果当前筛选的柜子已被删除，重置回「全部」
        let index = ids.indexOf(String(this.data.cabinetId || ''));
        if (index < 0) index = 0;
        this.setData({
          cabinets,
          cabinetOptions: options,
          cabinetIds: ids,
          cabinetIndex: index,
          cabinetId: ids[index] || ''
        }, () => this.applyFilter());
      },
      fail: () => {
        this.setData({ cabinets: [], cabinetOptions: ['全部'], cabinetIds: [''] });
      }
    });
  },

  onCabinetFilterChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({
      cabinetIndex: idx,
      cabinetId: this.data.cabinetIds[idx] || ''
    });
    this.applyFilter();
  },

  openCabinetManage() {
    this.setData({ showCabinetManage: true, cabinetName: '' });
    this.fetchCabinets();
  },

  closeCabinetManage() {
    this.setData({ showCabinetManage: false });
  },

  onCabinetNameInput(e) {
    this.setData({ cabinetName: e.detail.value });
  },

  addCabinet() {
    const name = (this.data.cabinetName || '').trim();
    if (!name) {
      wx.showToast({ title: '请输入柜子名称', icon: 'none' });
      return;
    }
    wx.request({
      url: app.globalData.baseUrl + '/api/cabinet/add',
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: {
        name,
        userId: app.globalData.userId || 'test_user_001'
      },
      success: (res) => {
        if (res.data && res.data.code === 200) {
          wx.showToast({ title: '柜子已添加', icon: 'success' });
          this.setData({ cabinetName: '' });
          this.fetchCabinets();
        } else {
          wx.showToast({ title: (res.data && res.data.msg) || '添加失败', icon: 'none' });
        }
      },
      fail: () => wx.showToast({ title: '网络异常', icon: 'none' })
    });
  },

  renameCabinet(e) {
    const id = e.currentTarget.dataset.id;
    const name = e.currentTarget.dataset.name || '';
    wx.showModal({
      title: '重命名柜子',
      content: name,
      editable: true,
      placeholderText: '请输入新名称',
      confirmColor: '#E05A86',
      success: (res) => {
        if (!res.confirm) return;
        const newName = (res.content || '').trim();
        if (!newName) {
          wx.showToast({ title: '名称不能为空', icon: 'none' });
          return;
        }
        wx.request({
          url: app.globalData.baseUrl + '/api/cabinet/update',
          method: 'PUT',
          header: { 'Content-Type': 'application/json' },
          data: { id, name: newName },
          success: (r) => {
            if (r.data && r.data.code === 200) {
              wx.showToast({ title: '已重命名', icon: 'success' });
              this.fetchCabinets();
            } else {
              wx.showToast({ title: (r.data && r.data.msg) || '修改失败', icon: 'none' });
            }
          },
          fail: () => wx.showToast({ title: '网络异常', icon: 'none' })
        });
      }
    });
  },

  deleteCabinet(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除柜子',
      content: '柜子里的裙子不会被删除，只移回「未分类」。确定删除吗？',
      confirmColor: '#E05A86',
      success: (res) => {
        if (!res.confirm) return;
        wx.request({
          url: app.globalData.baseUrl + '/api/cabinet/delete/' + id,
          method: 'DELETE',
          success: (r) => {
            if (r.data && r.data.code === 200) {
              wx.showToast({ title: '已删除', icon: 'success' });
              this.fetchCabinets();
            } else {
              wx.showToast({ title: (r.data && r.data.msg) || '删除失败', icon: 'none' });
            }
          },
          fail: () => wx.showToast({ title: '网络异常', icon: 'none' })
        });
      }
    });
  },

  goToAdd() {
    wx.navigateTo({ url: '/pages/add/add' });
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  }
})
