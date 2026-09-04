// utils/upload.js
// 通用图片上传工具：选择本地图片 → 上传至 /api/image/upload → 返回服务端返回的相对路径
// 后端只返回 "/images/{filename}"（不再拼 host），前端在渲染时由 resolveImageUrl 统一拼接 baseUrl。

function getBaseUrl() {
  // 优先从 globalData 拿；如果 app 还没 onLaunch（理论上不会），用 localhost 兜底
  const app = getApp && getApp()
  if (app && app.globalData && app.globalData.baseUrl) {
    return app.globalData.baseUrl
  }
  return 'http://localhost:8080'
}

/**
 * 把后端返回的 imageUrl 归一成可渲染的完整 URL
 * - 空：返回空串
 * - localhost/127.0.0.1 开头：把 host 替换成当前 baseUrl
 *     （兼容旧数据：之前用 dev tools 上传时落库的是 http://localhost:8080/...，真机无法访问）
 * - 其他 http(s)://：原样返回（兼容未来接入 CDN / 对象存储）
 * - 相对路径：拼接 baseUrl
 */
function resolveImageUrl(imageUrl, baseUrl) {
  if (!imageUrl) return ''
  const b = (baseUrl || getBaseUrl()).replace(/\/$/, '')
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(imageUrl)) {
    return imageUrl.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, b)
  }
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl
  const p = imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl
  return b + p
}

/**
 * 调用 wx.chooseImage 选择本地图片（相册或拍照）
 * @returns {Promise<string>} 选中的本地临时路径
 */
function chooseImage() {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths && res.tempFilePaths[0]
        if (!tempFilePath) {
          reject(new Error('未选择图片'))
        } else {
          resolve(tempFilePath)
        }
      },
      fail: (err) => reject(err)
    })
  })
}

/**
 * 将本地图片上传至后端
 * @param {string} filePath 本地临时路径
 * @returns {Promise<string>} 服务端返回的图片相对路径（如 /images/xxx.jpg）
 */
function uploadFile(filePath) {
  return new Promise((resolve, reject) => {
    const baseUrl = getBaseUrl()
    wx.uploadFile({
      url: baseUrl + '/api/image/upload',
      filePath: filePath,
      name: 'file',
      success: (res) => {
        console.log('[upload.js] 原始 res.statusCode =', res.statusCode)
        console.log('[upload.js] 原始 res.data 类型 =', typeof res.data)
        console.log('[upload.js] 原始 res.data =', res.data)

        let payload = res.data
        if (typeof payload === 'string') {
          try { payload = JSON.parse(payload) } catch (e) {
            console.warn('[upload.js] JSON.parse 失败, 原始内容:', payload)
          }
        }
        console.log('[upload.js] 解析后 payload =', JSON.stringify(payload))

        // 兼容后端 write-numbers-as-strings：code 可能是字符串 "200"
        const code = payload && payload.code != null ? Number(payload.code) : NaN
        const ok = code === 200 && payload.data

        if (ok) {
          // 后端当前只返回相对路径；万一以后又改成绝对 URL，这里 normalize 一次
          const normalized = resolveImageUrl(String(payload.data), baseUrl)
          console.log('[upload.js] 归一后 imageUrl =', normalized)
          resolve(normalized)
        } else {
          const reason = (payload && payload.msg) || '上传失败'
          reject(new Error('upload_failed: code=' + code + ' msg=' + reason))
        }
      },
      fail: (err) => reject(err)
    })
  })
}

/**
 * 一站式：选择 + 上传
 * @returns {Promise<string>} 完整可渲染的图片 URL
 */
function pickAndUpload() {
  return chooseImage().then(uploadFile)
}

module.exports = {
  chooseImage,
  uploadFile,
  pickAndUpload,
  getBaseUrl,
  resolveImageUrl
}
