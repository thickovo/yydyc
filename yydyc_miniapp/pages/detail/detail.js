const app = getApp()

Page({
  data: {
    skirt: null,
    today: '',
    skirtId: ''
  },

  onLoad(options) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const id = options.id;
    this.setData({
      today: todayStr,
      skirtId: id
    });
    this.fetchDetail(id);
  },

  onShow() {
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
        const data = res.data.data;
        const isPresale = !!data.saleStart && (data.deposit === 0 || !data.deposit) && (data.finalPayment === 0 || !data.finalPayment);
        const statusDate = isPresale ? data.saleStart : data.finalStart;
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

        const accessoriesArray = data.accessories
          ? data.accessories.split(',').filter(s => s.trim())
          : [];

        this.setData({
          skirt: {
            ...data,
            statusDate: statusDate,
            statusText: statusText,
            statusClass: statusClass,
            isPresale: isPresale,
            accessoriesArray: accessoriesArray
          }
        });
      },
      fail: (err) => {
        console.error('请求失败', err);
      }
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
      confirmColor: '#FF6B8A',
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
      confirmColor: '#FF6B8A',
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
      confirmColor: '#FF6B8A',
      success: (res) => {
        if (res.confirm) {
          this.updatePaidStatus(0);
        }
      }
    });
  },

  updatePaidStatus(isPaid) {
    const skirt = this.data.skirt;
    wx.request({
      url: app.globalData.baseUrl + '/api/wardrobe/update',
      method: 'PUT',
      header: { 'Content-Type': 'application/json' },
      data: {
        id: skirt.id,
        name: skirt.name,
        brand: skirt.brand,
        type: skirt.type,
        color: skirt.color,
        category: skirt.category,
        size: skirt.size,
        accessories: skirt.accessories || '',
        note: skirt.note || '',
        remindBefore: skirt.remindBefore || 1,
        userId: 'test_user_001',
        totalPrice: skirt.totalPrice,
        deposit: skirt.deposit || 0,
        finalPayment: skirt.finalPayment || 0,
        finalStart: skirt.finalStart || '',
        saleStart: skirt.saleStart || '',
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
  }
})
