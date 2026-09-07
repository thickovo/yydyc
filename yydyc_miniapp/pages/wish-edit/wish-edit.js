const app = getApp()
const { pickAndUpload, resolveImageUrl } = require('../../utils/upload.js')

Page({
  data: {
    id: '',
    name: '',
    brand: '',
    price: '',
    imageUrl: '',
    displayImageUrl: '',
    note: '',
    purchaseLink: '',
    uploading: false,
    isEdit: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id, isEdit: true })
      wx.setNavigationBarTitle({ title: '编辑心愿' })
      app.getUserId().then(() => this.fetchDetail(options.id))
    } else {
      wx.setNavigationBarTitle({ title: '添加心愿' })
    }
  },

  fetchDetail(id) {
    const userId = app.globalData.userId || 'test_user_001'
    const baseUrl = app.globalData.baseUrl
    // 复用 wish list 接口，按 id 查找
    wx.request({
      url: baseUrl + '/api/wish/list?userId=' + userId,
      method: 'GET',
      success: (res) => {
        // 响应解析加防护：后端错误时 res.data 可能没有 data 字段
        const list = (res && res.data && res.data.data) || []
        const item = list.find(w => String(w.id) === String(id))
        if (item) {
          this.setData({
            name: item.name || '',
            brand: item.brand || '',
            price: item.price || '',
            imageUrl: item.imageUrl || '',
            displayImageUrl: resolveImageUrl(item.imageUrl, baseUrl),
            note: item.note || '',
            purchaseLink: item.purchaseLink || ''
          })
        }
      },
      fail: () => {
        wx.showToast({ title: '数据加载失败', icon: 'none' })
      }
    })
  },

  handleInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [field]: e.detail.value })
  },

  onPickImage() {
    if (this.data.uploading) return
    this.setData({ uploading: true })
    wx.showLoading({ title: '上传中...' })
    pickAndUpload()
      .then((url) => {
        this.setData({ imageUrl: url, displayImageUrl: url })
        wx.hideLoading()
        app.toast('上传成功', 'success')
      })
      .catch(() => {
        wx.hideLoading()
        app.toast('上传失败', 'none')
      })
      .finally(() => this.setData({ uploading: false }))
  },

  onRemoveImage() {
    this.setData({ imageUrl: '', displayImageUrl: '' })
  },

  onSubmit() {
    const { id, name, brand, price, imageUrl, note, purchaseLink, isEdit } = this.data
    if (!name || !name.trim()) {
      app.toast('请填写心愿商品名称')
      return
    }
    const data = {
      name: name.trim(),
      brand: brand.trim(),
      price: parseFloat(price) || 0,
      imageUrl: imageUrl || '',
      note: note.trim(),
      purchaseLink: purchaseLink.trim(),
      userId: app.globalData.userId || 'test_user_001'
    }
    const url = isEdit
      ? app.globalData.baseUrl + '/api/wish/update'
      : app.globalData.baseUrl + '/api/wish/add'
    const method = isEdit ? 'PUT' : 'POST'
    if (isEdit) {
      data.id = id
    }

    wx.request({
      url,
      method,
      header: { 'Content-Type': 'application/json' },
      data,
      success: (res) => {
        if (res.data && res.data.code === 200) {
          app.toast(isEdit ? '修改成功' : '添加成功 ✨', 'success')
          setTimeout(() => wx.navigateBack(), 1200)
        } else {
          app.toast(res.data && res.data.msg ? res.data.msg : '操作失败')
        }
      },
      fail: () => app.toast('网络异常')
    })
  }
})
