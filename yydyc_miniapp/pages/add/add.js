const app = getApp()
const { pickAndUpload, resolveImageUrl } = require('../../utils/upload.js')

Page({
  data: {
    typeOptions: ['JSK', 'OP', 'SK', '衬衫', '外套', '背带裙', '其他'],
    categoryOptions: ['裙子', '袜子', '鞋', '配饰', '其他'],
    sizeOptions: ['XS', 'S', 'M', 'L', 'XL', '定制', '均码'],
    accessoriesOptions: ['发带', 'KC', '头纱', '礼帽', '手袖', '胸针', '项链', '耳饰', '手套', '过膝袜', '裙撑', '包袋'],
    // 小物：用 [{name, selected}] 描述，避免 WXML 中 indexOf 表达式不刷新的问题
    accessoryList: [],
    buyMode: 'deposit',
    name: '',
    brand: '',
    type: '',
    color: '',
    totalPrice: '',
    deposit: '',
    finalPayment: '',
    finalStart: '',
    saleStart: '',
    remindBefore: 1,
    note: '',
    selectedColor: '',
    category: '裙子',
    size: '',
    accessories: [],
    customAccessory: '',
    // 柜子分类
    cabinetOptions: ['未分类'],
    cabinetIds: [''],
    cabinetIndex: 0,
    cabinetId: '',
    // 图片上传相关
    imageUrl: '',
    uploading: false
  },

  onLoad() {
    // 初始化小物列表的选中状态
    const accessoryList = this.data.accessoriesOptions.map(name => ({
      name,
      selected: false
    }))
    this.setData({ accessoryList })
    app.getUserId().then(() => this.fetchCabinets())
  },

  fetchCabinets() {
    const userId = app.globalData.userId || 'test_user_001'
    wx.request({
      url: app.globalData.baseUrl + '/api/cabinet/list?userId=' + userId,
      method: 'GET',
      success: (res) => {
        const list = (res.data && res.data.data) || []
        const cabinets = list.map(c => ({ id: String(c.id), name: c.name || '未命名' }))
        this.setData({
          cabinets,
          cabinetOptions: ['未分类'].concat(cabinets.map(c => c.name)),
          cabinetIds: [''].concat(cabinets.map(c => c.id))
        })
      },
      fail: () => {
        this.setData({ cabinetOptions: ['未分类'], cabinetIds: [''] })
      }
    })
  },

  handleCabinetChange(e) {
    const idx = parseInt(e.detail.value)
    this.setData({
      cabinetIndex: idx,
      cabinetId: this.data.cabinetIds[idx] || ''
    })
  },

  switchBuyMode(e) {
    const mode = e.currentTarget.dataset.mode;
    if (mode === 'presale') {
      this.setData({
        buyMode: mode,
        finalStart: '',
        deposit: '',
        finalPayment: ''
      });
    } else if (mode === 'stock') {
      // 全款现货：清空所有时间/提醒相关字段
      this.setData({
        buyMode: mode,
        saleStart: '',
        finalStart: '',
        deposit: 0,
        finalPayment: 0
      });
    } else {
      this.setData({
        buyMode: mode,
        saleStart: '',
        totalPrice: ''
      });
    }
  },

  handleTypeChange(e) {
    const index = e.detail.value;
    this.setData({ type: this.data.typeOptions[index] });
  },

  handleCategoryChange(e) {
    const index = e.detail.value;
    this.setData({ category: this.data.categoryOptions[index] });
  },

  handleSizeChange(e) {
    const index = e.detail.value;
    this.setData({ size: this.data.sizeOptions[index] });
  },

  handleInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({ [field]: value });
  },

  handleFinalStartChange(e) {
    this.setData({ finalStart: e.detail.value });
  },

  handleSaleStartChange(e) {
    this.setData({ saleStart: e.detail.value });
  },

  selectColor(e) {
    const color = e.currentTarget.dataset.color;
    this.setData({
      selectedColor: color,
      color: color
    });
  },

  selectRemindBefore(e) {
    const days = parseInt(e.currentTarget.dataset.days);
    this.setData({ remindBefore: days });
  },

  // 小物：和颜色选择一致的"点选/再点取消"
  toggleAccessory(e) {
    const name = e.currentTarget.dataset.accessory;
    const accessoryList = this.data.accessoryList.map(item => {
      if (item.name === name) {
        return { ...item, selected: !item.selected };
      }
      return item;
    });
    const accessories = accessoryList.filter(item => item.selected).map(item => item.name);
    this.setData({ accessoryList, accessories });
  },

  handleCustomAccessoryInput(e) {
    this.setData({ customAccessory: e.detail.value });
  },

  addCustomAccessory() {
    const custom = this.data.customAccessory.trim();
    if (!custom) return;
    if (this.data.accessoryList.some(item => item.name === custom)) {
      wx.showToast({ title: '该小物已存在', icon: 'none' });
      return;
    }
    const accessoryList = [...this.data.accessoryList, { name: custom, selected: true }];
    const accessories = accessoryList.filter(item => item.selected).map(item => item.name);
    this.setData({
      accessoryList,
      accessories,
      customAccessory: ''
    });
  },

  // 点击上传区域：选图 + 自动上传
  onPickImage() {
    console.log('[onPickImage] 调用, 当前 imageUrl =', this.data.imageUrl);

    if (this.data.uploading) return;
    this.setData({ uploading: true });
    wx.showLoading({ title: '上传中...', mask: true });

    pickAndUpload()
      .then((url) => {
        console.log('[onPickImage] 上传成功, 准备 setData, url =', url);
        // upload.js 已用 resolveImageUrl 归一成完整 URL，
        // imageUrl 存原值（相对路径或绝对 URL），displayImageUrl 用于 WXML 渲染
        this.setData({ imageUrl: url, displayImageUrl: url }, () => {
          console.log('[onPickImage] setData 完成, 当前 data.imageUrl =', this.data.imageUrl);
        });
        // 兜底：下一帧再确认一次，避免极少数情况下 WXML 没及时刷新
        wx.nextTick(() => {
          console.log('[onPickImage] nextTick 后 imageUrl =', this.data.imageUrl);
        });
        wx.hideLoading();
        wx.showToast({ title: '上传成功', icon: 'success' });
      })
      .catch((err) => {
        console.error('[onPickImage] 上传失败:', err);
        wx.hideLoading();
        // 区分错误类型给用户更明确的提示
        const msg = (err && err.message) || ''
        let tip = '上传失败，请重试'
        if (msg.startsWith('upload_http_error')) {
          tip = '图片上传接口异常（HTTP），请检查后端是否启动'
        } else if (msg.startsWith('upload_network_error')) {
          tip = '网络异常，请检查网络后重试'
        } else if (msg.startsWith('upload_empty_response') || msg.startsWith('upload_invalid_json')) {
          tip = '后端返回异常，请确认 /api/image/upload 接口已实现'
        } else if (msg.startsWith('upload_failed')) {
          tip = '上传失败：' + (msg.split('msg=')[1] || '请稍后再试')
        }
        wx.showToast({
          title: tip,
          icon: 'none',
          duration: 2500
        });
      })
      .finally(() => {
        this.setData({ uploading: false });
      });
  },

  // 图片加载失败时打日志（便于诊断 URL 是否可访问）
  onImageError(e) {
    console.error('[onPickImage] image 加载失败:', e.detail, 'src =', this.data.imageUrl);
  },

  // 移除图片（可选，让用户能清除）
  onRemoveImage() {
    this.setData({ imageUrl: '', displayImageUrl: '' });
  },

  handleSubmit() {
    const { name, brand, type, color, totalPrice, deposit, finalPayment, finalStart, saleStart, remindBefore, note, buyMode, category, size, accessories, imageUrl, cabinetId } = this.data;

    if (!name) {
      wx.showToast({ title: '请输入名称', icon: 'none' });
      return;
    }

    const data = {
      name,
      brand,
      type,
      color,
      note,
      remindBefore: buyMode === 'stock' ? 0 : remindBefore,
      userId: app.globalData.userId || 'test_user_001',
      category: category || '裙子',
      size: size || '',
      accessories: accessories.join(','),
      imageUrl: imageUrl || '',
      cabinetId: cabinetId || null
    };

    if (buyMode === 'deposit') {
      data.deposit = parseFloat(deposit) || 0;
      data.finalPayment = parseFloat(finalPayment) || 0;
      data.finalStart = finalStart || null;
      data.totalPrice = (parseFloat(deposit) || 0) + (parseFloat(finalPayment) || 0);
      data.saleStart = null;
    } else if (buyMode === 'presale') {
      data.totalPrice = parseFloat(totalPrice) || 0;
      data.saleStart = saleStart || null;
      data.deposit = 0;
      data.finalPayment = 0;
      data.finalStart = null;
    } else {
      // stock 全款现货
      data.totalPrice = parseFloat(totalPrice) || 0;
      data.deposit = 0;
      data.finalPayment = 0;
      data.finalStart = null;
      data.saleStart = null;
    }

    wx.request({
      url: app.globalData.baseUrl + '/api/wardrobe/add',
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: data,
      success: () => {
        wx.showToast({ title: '添加成功 ✨', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 1500);
      },
      fail: () => {
        wx.showToast({ title: '添加失败', icon: 'none' });
      }
    });
  }
})
