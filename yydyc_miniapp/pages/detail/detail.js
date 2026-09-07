const app = getApp()
const { pickAndUpload, resolveImageUrl } = require('../../utils/upload.js')

Page({
  data: {
    skirt: null,
    today: '',
    skirtId: '',
    // 多图管理
    images: [],
    swiperImages: [],
    current: 0,
    showImageManage: false,
    uploading: false
  },

  onLoad(options) {
    const now = new Date();
    const pad = (n) => (n < 10 ? '0' + n : n);
    const todayStr = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
    const id = options.id;
    this.setData({
      today: todayStr,
      skirtId: id
    });
    this.fetchDetail(id);
  },

  onShow() {
    // 避免重复请求：图片管理抽屉关闭时已刷过数据，这里跳过下一次 onShow 自动刷新
    if (this.data._skipNextFetch) {
      this.setData({ _skipNextFetch: false });
      return;
    }
    if (this.data.skirtId) {
      this.fetchDetail(this.data.skirtId);
    }
  },

  fetchDetail(id) {
    const todayStr = this.data.today;
    wx.request({
      url: app.globalData.baseUrl + '/api/wardrobe/detail/' + id,
      method: 'GET',
      success: (res) => {
        // 响应解析加防护：后端错误时 res.data 可能没有 data 字段
        const data = (res && res.data && res.data.data) || null;
        if (!data) {
          wx.showToast({ title: '数据加载失败', icon: 'none' });
          return;
        }
        const isSold = Number(data.status || 0) === 3;
        const isPresale = !!data.saleStart && (data.deposit === 0 || !data.deposit) && (data.finalPayment === 0 || !data.finalPayment);
        // 后端返回 "yyyy-MM-dd HH:mm:ss"，比较前截断成日期，避免含时间导致「今日」永远不命中
        const rawStatusDate = (isPresale ? data.saleStart : data.finalStart) || '';
        const statusDate = rawStatusDate ? String(rawStatusDate).substring(0, 10) : '';
        let statusText = '待补款';
        let statusClass = 'pending';

        if (isSold) {
          statusText = '已出掉';
          statusClass = 'sold';
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

        const accessoriesArray = data.accessories
          ? data.accessories.split(',').filter(s => s.trim())
          : [];

        // 多图：skirt_image 表；老数据没有多图时用衣柜主图兜底
        const baseUrl = app.globalData.baseUrl;
        const imageList = (data.images || []).map(img => ({
          id: String(img.id),
          imageUrl: img.imageUrl || '',
          displayUrl: resolveImageUrl(img.imageUrl, baseUrl),
          isCover: Number(img.isCover || 0) === 1
        }));
        const sourceImages = imageList.length > 0
          ? imageList
          : (data.imageUrl
              ? [{ id: '', imageUrl: data.imageUrl, displayUrl: resolveImageUrl(data.imageUrl, baseUrl), isCover: true }]
              : []);

        this.setData({
          skirt: {
            ...data,
            statusDate: statusDate,
            statusText: statusText,
            statusClass: statusClass,
            isSold: isSold,
            isPresale: isPresale,
            accessoriesArray: accessoriesArray
          },
          images: imageList,
          swiperImages: sourceImages.map(i => i.displayUrl),
          current: 0
        });
        // 详情设置的封面同步成列表页卡片展示图
        this.syncCoverToList();
      },
      fail: (err) => {
        console.error('请求失败', err);
      }
    });
  },

  onSwiperChange(e) {
    this.setData({ current: e.detail.current });
  },

  // 详情页「管理图片」设定的封面 = 列表页显示的主图（同步 wardrobe.imageUrl）
  syncCoverToList() {
    const cover = this.data.images.find(img => img.isCover && img.imageUrl);
    const skirt = this.data.skirt;
    if (!cover || !skirt) return;
    if (cover.imageUrl === skirt.imageUrl) return;
    // 后端 wardrobe/update 是全字段更新，必须带上所有字段，否则未传字段会被清空
    wx.request({
      url: app.globalData.baseUrl + '/api/wardrobe/update',
      method: 'PUT',
      header: { 'Content-Type': 'application/json' },
      data: {
        id: skirt.id,
        userId: skirt.userId || app.globalData.userId || 'test_user_001',
        name: skirt.name,
        brand: skirt.brand,
        type: skirt.type,
        color: skirt.color,
        category: skirt.category,
        size: skirt.size,
        accessories: skirt.accessories || '',
        note: skirt.note || '',
        remindBefore: skirt.remindBefore || 1,
        totalPrice: skirt.totalPrice,
        deposit: skirt.deposit || 0,
        finalPayment: skirt.finalPayment || 0,
        finalStart: skirt.finalStart || null,
        saleStart: skirt.saleStart || null,
        cabinetId: skirt.cabinetId || null,
        imageUrl: cover.imageUrl
      },
      success: () => {
        this.setData({ 'skirt.imageUrl': cover.imageUrl });
      },
      fail: () => {}
    });
  },

  goToEdit() {
    wx.navigateTo({
      url: '/pages/edit/edit?id=' + this.data.skirt.id
    });
  },

  deleteSkirt() {
    wx.showModal({
      title: '删除确认',
      content: '确定要删除这条裙子吗？',
      confirmColor: '#E05A86',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: app.globalData.baseUrl + '/api/wardrobe/delete/' + this.data.skirt.id,
            method: 'DELETE',
            success: () => {
              wx.showToast({ title: '已删除', icon: 'success' });
              setTimeout(() => wx.navigateBack(), 1000);
            },
            fail: () => {
              wx.showToast({ title: '删除失败', icon: 'none' });
            }
          });
        }
      }
    });
  },

  markAsBought() {
    wx.showModal({
      title: '确认',
      content: '标记为已买？',
      confirmColor: '#E05A86',
      success: (res) => {
        if (res.confirm) {
          this.updatePaidStatus(1);
        }
      }
    });
  },

  markAsNotBought() {
    wx.showModal({
      title: '确认',
      content: '标记为未买？',
      confirmColor: '#E05A86',
      success: (res) => {
        if (res.confirm) {
          this.updatePaidStatus(0);
        }
      }
    });
  },

  updatePaidStatus(isPaid) {
    const skirt = this.data.skirt;
    if (!skirt) return;
    // 后端 wardrobe/update 是全字段更新，必须带上所有字段，否则未传字段会被清空
    wx.request({
      url: app.globalData.baseUrl + '/api/wardrobe/update',
      method: 'PUT',
      header: { 'Content-Type': 'application/json' },
      data: {
        id: skirt.id,
        userId: skirt.userId || app.globalData.userId || 'test_user_001',
        name: skirt.name,
        brand: skirt.brand,
        type: skirt.type,
        color: skirt.color,
        category: skirt.category,
        size: skirt.size,
        accessories: skirt.accessories || '',
        note: skirt.note || '',
        remindBefore: skirt.remindBefore || 1,
        totalPrice: skirt.totalPrice,
        deposit: skirt.deposit || 0,
        finalPayment: skirt.finalPayment || 0,
        finalStart: skirt.finalStart || null,
        saleStart: skirt.saleStart || null,
        cabinetId: skirt.cabinetId || null,
        imageUrl: skirt.imageUrl || '',
        isPaid: isPaid
      },
      success: () => {
        wx.showToast({ title: isPaid ? '已标记为已买' : '已标记为未买', icon: 'success' });
        this.fetchDetail(this.data.skirtId);
      },
      fail: () => {
        wx.showToast({ title: '操作失败', icon: 'none' });
      }
    });
  },

  copyLink() {
    const link = this.data.skirt.purchaseLink;
    if (link) {
      wx.setClipboardData({
        data: link,
        success: () => {
          wx.showToast({ title: '链接已复制', icon: 'success' });
        }
      });
    }
  },

  // ===== 图片管理 =====
  openImageManage() {
    this.setData({ showImageManage: true, uploading: false });
  },

  closeImageManage() {
    // 关闭抽屉时不再触发 onShow 的重复请求（refreshAfterImageOp 已经刷过数据）
    this.setData({ showImageManage: false, _skipNextFetch: true });
  },

  onPickImage() {
    if (this.data.uploading || !this.data.skirt) return;
    this.setData({ uploading: true });
    wx.showLoading({ title: '上传中...', mask: true });
    pickAndUpload()
      .then((url) => {
        wx.hideLoading();
        this.addImageToSkirt(url);
      })
      .catch(() => {
        wx.hideLoading();
        wx.showToast({ title: '上传失败，请重试', icon: 'none' });
      })
      .finally(() => {
        this.setData({ uploading: false });
      });
  },

  addImageToSkirt(url) {
    const skirtId = this.data.skirt.id;
    wx.request({
      url: app.globalData.baseUrl + '/api/wardrobe/image/add?skirtId=' + skirtId + '&imageUrl=' + encodeURIComponent(url),
      method: 'POST',
      success: (res) => {
        if (res.data && res.data.code === 200) {
          this.refreshAfterImageOp('图片已添加');
        } else {
          wx.showToast({ title: (res.data && res.data.msg) || '添加失败', icon: 'none' });
        }
      },
      fail: () => wx.showToast({ title: '网络异常', icon: 'none' })
    });
  },

  deleteImage(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除图片',
      content: '确定删除这张图片吗？',
      confirmColor: '#E05A86',
      success: (res) => {
        if (!res.confirm) return;
        wx.request({
          url: app.globalData.baseUrl + '/api/wardrobe/image/delete/' + id,
          method: 'DELETE',
          success: (r) => {
            if (r.data && r.data.code === 200) {
              this.refreshAfterImageOp('已删除');
            } else {
              wx.showToast({ title: (r.data && r.data.msg) || '删除失败', icon: 'none' });
            }
          },
          fail: () => wx.showToast({ title: '网络异常', icon: 'none' })
        });
      }
    });
  },

  setCover(e) {
    const id = e.currentTarget.dataset.id;
    wx.request({
      url: app.globalData.baseUrl + '/api/wardrobe/image/cover/' + id,
      method: 'PUT',
      success: (res) => {
        if (res.data && res.data.code === 200) {
          this.refreshAfterImageOp('已设为封面');
        } else {
          wx.showToast({ title: (res.data && res.data.msg) || '操作失败', icon: 'none' });
        }
      },
      fail: () => wx.showToast({ title: '网络异常', icon: 'none' })
    });
  },

  refreshAfterImageOp(toastText) {
    wx.showToast({ title: toastText, icon: 'success' });
    this.fetchDetail(this.data.skirtId);
  },

  // ===== 售出状态流转 =====
  toggleSold() {
    const skirt = this.data.skirt;
    if (!skirt) return;
    const isSold = skirt.isSold;
    wx.showModal({
      title: isSold ? '取消出掉' : '标记已出掉',
      content: isSold ? '确认把这条裙子恢复为未出掉？' : '确认这件小裙子已经出掉了吗？',
      confirmColor: '#E05A86',
      success: (res) => {
        if (!res.confirm) return;
        const action = isSold ? 'unmark' : 'mark';
        wx.request({
          url: app.globalData.baseUrl + '/api/wardrobe/' + action + '-sold/' + skirt.id,
          method: 'PUT',
          success: (r) => {
            if (r.data && r.data.code === 200) {
              wx.showToast({ title: isSold ? '已恢复未出掉' : '已标记出掉', icon: 'success' });
              this.fetchDetail(this.data.skirtId);
            } else {
              wx.showToast({ title: (r.data && r.data.msg) || '操作失败', icon: 'none' });
            }
          },
          fail: () => wx.showToast({ title: '网络异常', icon: 'none' })
        });
      }
    });
  }
})
