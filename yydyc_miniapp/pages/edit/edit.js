const app = getApp()
const { pickAndUpload, resolveImageUrl } = require('../../utils/upload.js')

Page({
  data: {
    typeOptions: ['JSK', 'OP', 'SK', '衬衫', '外套', '背带裙', '其他'],
    categoryOptions: ['裙子', '袜子', '鞋', '配饰', '其他'],
    sizeOptions: ['XS', 'S', 'M', 'L', 'XL', '定制', '均码'],
    accessoriesOptions: ['发带', 'KC', '头纱', '礼帽', '手袖', '胸针', '项链', '耳饰', '手套', '过膝袜', '裙撑', '包袋', '自定义'],
    // 小物：用 [{name, selected}] 描述，便于 WXML 中可靠渲染
    accessoryList: [],
    id: '',
    name: '',
    brand: '',
    type: '',
    color: '',
    totalPrice: '',
    deposit: '',
    finalPayment: '',
    finalStart: '',
    finalDate: '',
    saleStart: '',
    remindBefore: 1,
    note: '',
    selectedColor: '',
    buyMode: 'deposit',
    category: '裙子',
    size: '',
    accessories: [],
    originalFinalStart: '',
    originalSaleStart: '',
    originalFinalDate: '',
    // 柜子分类
    cabinetOptions: ['未分类'],
    cabinetIds: [''],
    cabinetIndex: 0,
    cabinetId: '',
    // 图片
    imageUrl: '',
    uploading: false
  },

  onLoad(options) {
    const id = options.id;
    this.setData({ id: id });
    app.getUserId().then(() => this.fetchDetail(id));
  },

  fetchDetail(id) {
    const baseUrl = app.globalData.baseUrl;
    wx.request({
      url: baseUrl + '/api/wardrobe/detail/' + id,
      method: 'GET',
      success: (res) => {
        // 响应解析加防护：后端错误时 res.data 可能没有 data 字段
        const data = (res && res.data && res.data.data) || null;
        if (!data) {
          wx.showToast({ title: '数据加载失败', icon: 'none' });
          return;
        }
        const buyMode = data.saleStart ? 'presale' : 'deposit';
        const selectedAccessories = data.accessories ? data.accessories.split(',').filter(s => s.trim()) : [];

        // 合并：预设选项 + 已选的自定义小物
        const optionSet = new Set(this.data.accessoriesOptions);
        const mergedNames = [...this.data.accessoriesOptions];
        selectedAccessories.forEach(name => {
          if (!optionSet.has(name)) mergedNames.push(name);
        });

        const accessoryList = mergedNames.map(name => ({
          name,
          selected: selectedAccessories.indexOf(name) > -1
        }));

        this.setData({
          name: data.name || '',
          brand: data.brand || '',
          type: data.type || '',
          color: data.color || '',
          totalPrice: data.totalPrice ? String(data.totalPrice) : '',
          deposit: data.deposit ? String(data.deposit) : '',
          finalPayment: data.finalPayment ? String(data.finalPayment) : '',
          finalStart: data.finalStart || '',
          finalDate: data.finalDate || '',
          saleStart: data.saleStart || '',
          remindBefore: data.remindBefore || 1,
          note: data.note || '',
          selectedColor: data.color || '',
          buyMode: buyMode,
          category: data.category || '裙子',
          size: data.size || '',
          accessories: selectedAccessories,
          accessoryList: accessoryList,
          originalFinalStart: data.finalStart || '',
          originalSaleStart: data.saleStart || '',
          originalFinalDate: data.finalDate || '',
          // imageUrl 保留后端原始值（可能是 /images/xxx.jpg 或 http://...），
          // displayImageUrl 用于 WXML 渲染，由 resolveImageUrl 拼上当前 baseUrl
          imageUrl: data.imageUrl || '',
          displayImageUrl: resolveImageUrl(data.imageUrl, baseUrl)
        });
        this.fetchCabinets(data.cabinetId);
      },
      fail: (err) => {
        console.error('请求失败', err);
      }
    });
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

  fetchCabinets(selectedId) {
    const userId = app.globalData.userId || 'test_user_001';
    wx.request({
      url: app.globalData.baseUrl + '/api/cabinet/list?userId=' + userId,
      method: 'GET',
      success: (res) => {
        const list = (res.data && res.data.data) || [];
        const cabinets = list.map(c => ({ id: String(c.id), name: c.name || '未命名' }));
        const options = ['未分类'].concat(cabinets.map(c => c.name));
        const ids = [''].concat(cabinets.map(c => c.id));
        let index = selectedId ? ids.indexOf(String(selectedId)) : 0;
        if (index < 0) index = 0;
        this.setData({
          cabinets,
          cabinetOptions: options,
          cabinetIds: ids,
          cabinetIndex: index,
          cabinetId: ids[index] || ''
        });
      },
      fail: () => {
        this.setData({ cabinetOptions: ['未分类'], cabinetIds: [''] });
      }
    });
  },

  handleCabinetChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({
      cabinetIndex: idx,
      cabinetId: this.data.cabinetIds[idx] || ''
    });
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

  // 小物多选
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

  // 图片上传/重新上传
  onPickImage() {
    console.log('[onPickImage] 调用, 当前 imageUrl =', this.data.imageUrl);

    if (this.data.uploading) return;
    this.setData({ uploading: true });
    wx.showLoading({ title: '上传中...', mask: true });

    pickAndUpload()
      .then((url) => {
        console.log('[onPickImage] 上传成功, 准备 setData, url =', url);
        // upload.js 已用 resolveImageUrl 归一成完整 URL，
        // 这里 imageUrl / displayImageUrl 同步存，方便后续提交 + WXML 渲染
        this.setData({ imageUrl: url, displayImageUrl: url }, () => {
          console.log('[onPickImage] setData 完成, 当前 data.imageUrl =', this.data.imageUrl);
        });
        wx.nextTick(() => {
          console.log('[onPickImage] nextTick 后 imageUrl =', this.data.imageUrl);
        });
        wx.hideLoading();
        wx.showToast({ title: '上传成功', icon: 'success' });
      })
      .catch((err) => {
        console.error('[onPickImage] 上传失败:', err);
        wx.hideLoading();
        wx.showToast({
          title: '上传失败，请重试',
          icon: 'none'
        });
      })
      .finally(() => {
        this.setData({ uploading: false });
      });
  },

  onImageError(e) {
    console.error('[onPickImage] image 加载失败:', e.detail, 'src =', this.data.imageUrl);
  },

  onRemoveImage() {
    this.setData({ imageUrl: '', displayImageUrl: '' });
  },

  handleSubmit() {
    const {
      id, name, brand, type, color, totalPrice, deposit, finalPayment,
      finalStart, finalDate, saleStart, remindBefore, note, buyMode,
      originalFinalStart, originalSaleStart, originalFinalDate,
      category, size, accessories, imageUrl, cabinetId
    } = this.data;

    if (!name) {
      wx.showToast({ title: '请输入名称', icon: 'none' });
      return;
    }

    const data = {
      id: id,
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
      // 切到定尾模式时把 saleStart 写回 null（后端字段策略已设为 ALWAYS），
      // 不能用空串，否则 Jackson 反序列化为 LocalDate 会抛错
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

    const timeChanged =
      finalStart !== originalFinalStart ||
      saleStart !== originalSaleStart ||
      finalDate !== originalFinalDate;

    if (timeChanged) {
      data.isPaid = 0;
    }

    wx.request({
      url: app.globalData.baseUrl + '/api/wardrobe/update',
      method: 'PUT',
      header: { 'Content-Type': 'application/json' },
      data: data,
      success: () => {
        wx.showToast({ title: '修改成功', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 1500);
      },
      fail: () => {
        wx.showToast({ title: '修改失败', icon: 'none' });
      }
    });
  }
})
