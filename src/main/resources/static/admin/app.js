// 云裳记 · 管理后台 SPA
// 用 hash 路由 + localStorage 保持登录态

const { createApp, ref, reactive, computed, onMounted, watch } = Vue;

const ADMIN_PASSWORD = 'admin123'
const STORAGE_KEY = 'yydyc_admin_logged_in'

// 自动检测后端 baseUrl：与当前页面同源（同主机端口）
const API_BASE = (() => {
  const { protocol, host } = window.location
  // 如果当前是 :8080/admin/...，就直接同源访问 /api/...
  return `${protocol}//${host}`
})()

const app = createApp({
  setup() {
    // ============ 登录态 ============
    const loggedIn = ref(localStorage.getItem(STORAGE_KEY) === 'true')
    const loginForm = reactive({ password: '' })
    const loggingIn = ref(false)

    function onLogin() {
      if (!loginForm.password) {
        ElementPlus.ElMessage.warning('请输入密码')
        return
      }
      loggingIn.value = true
      // 前端简单校验（实际生产应走后端鉴权接口）
      setTimeout(() => {
        if (loginForm.password === ADMIN_PASSWORD) {
          localStorage.setItem(STORAGE_KEY, 'true')
          loggedIn.value = true
          ElementPlus.ElMessage.success('登录成功')
          // 登录后默认进入反馈管理
          activeMenu.value = 'feedback'
          fetchFeedbacks()
        } else {
          ElementPlus.ElMessage.error('密码错误')
        }
        loggingIn.value = false
      }, 300)
    }

    function onLogout() {
      localStorage.removeItem(STORAGE_KEY)
      loggedIn.value = false
      loginForm.password = ''
    }

    // ============ 路由 ============
    const activeMenu = ref('feedback')
    const headerTitle = computed(() => {
      return activeMenu.value === 'feedback' ? '反馈管理' : '配置管理'
    })

    function onSelectMenu(index) {
      activeMenu.value = index
      if (index === 'feedback') fetchFeedbacks()
      if (index === 'config') fetchConfig()
    }

    // ============ 反馈管理 ============
    const feedbackLoading = ref(false)
    const feedbacks = ref([])
    const feedbackFilters = reactive({ status: '' })
    const feedbackPage = reactive({ current: 1, size: 10, total: 0 })

    function resetFeedbackFilters() {
      feedbackFilters.status = ''
      feedbackPage.current = 1
      fetchFeedbacks()
    }

    async function fetchFeedbacks() {
      feedbackLoading.value = true
      try {
        const params = new URLSearchParams({
          page: feedbackPage.current,
          size: feedbackPage.size
        })
        if (feedbackFilters.status !== '' && feedbackFilters.status !== null) {
          params.append('status', feedbackFilters.status)
        }
        const res = await fetch(`${API_BASE}/api/admin/feedback/list?${params}`)
        const json = await res.json()
        if (json.code === 200) {
          feedbacks.value = json.data.records || []
          feedbackPage.total = json.data.total || 0
        } else {
          ElementPlus.ElMessage.error(json.msg || '加载失败')
        }
      } catch (e) {
        ElementPlus.ElMessage.error('网络异常：' + e.message)
      } finally {
        feedbackLoading.value = false
      }
    }

    async function handleFeedback(row) {
      try {
        const res = await fetch(`${API_BASE}/api/admin/feedback/handle/${row.id}`, {
          method: 'PUT'
        })
        const json = await res.json()
        if (json.code === 200) {
          ElementPlus.ElMessage.success('已标记为已处理')
          fetchFeedbacks()
        } else {
          ElementPlus.ElMessage.error(json.msg || '操作失败')
        }
      } catch (e) {
        ElementPlus.ElMessage.error('网络异常：' + e.message)
      }
    }

    function deleteFeedback(row) {
      ElementPlus.ElMessageBox.confirm(
        `确定要删除 ID=${row.id} 的反馈吗？`,
        '删除确认',
        { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
      ).then(async () => {
        try {
          const res = await fetch(`${API_BASE}/api/admin/feedback/delete/${row.id}`, {
            method: 'DELETE'
          })
          const json = await res.json()
          if (json.code === 200) {
            ElementPlus.ElMessage.success('删除成功')
            fetchFeedbacks()
          } else {
            ElementPlus.ElMessage.error(json.msg || '删除失败')
          }
        } catch (e) {
          ElementPlus.ElMessage.error('网络异常：' + e.message)
        }
      }).catch(() => {})
    }

    // ============ 配置管理 ============
    const configKey = ref('')
    const config = ref(null)
    const configSaving = ref(false)

    async function fetchConfig() {
      if (!configKey.value) {
        ElementPlus.ElMessage.warning('请输入配置 key')
        return
      }
      try {
        const res = await fetch(`${API_BASE}/api/admin/config/get/${encodeURIComponent(configKey.value)}`)
        const json = await res.json()
        if (json.code === 200 && json.data) {
          config.value = json.data
          ElementPlus.ElMessage.success('加载成功')
        } else {
          config.value = null
          ElementPlus.ElMessage.warning('配置不存在')
        }
      } catch (e) {
        ElementPlus.ElMessage.error('网络异常：' + e.message)
      }
    }

    async function saveConfig() {
      if (!config.value) return
      configSaving.value = true
      try {
        const params = new URLSearchParams({
          key: config.value.configKey,
          value: config.value.configValue
        })
        const res = await fetch(`${API_BASE}/api/admin/config/update?${params}`, {
          method: 'PUT'
        })
        const json = await res.json()
        if (json.code === 200) {
          ElementPlus.ElMessage.success('保存成功')
        } else {
          ElementPlus.ElMessage.error(json.msg || '保存失败')
        }
      } catch (e) {
        ElementPlus.ElMessage.error('网络异常：' + e.message)
      } finally {
        configSaving.value = false
      }
    }

    // ============ 初始化 ============
    onMounted(() => {
      if (loggedIn.value) {
        fetchFeedbacks()
      }
    })

    return {
      // 登录
      loggedIn,
      loginForm,
      loggingIn,
      onLogin,
      onLogout,
      // 路由
      activeMenu,
      headerTitle,
      onSelectMenu,
      apiBase: API_BASE,
      // 反馈
      feedbacks,
      feedbackLoading,
      feedbackFilters,
      feedbackPage,
      fetchFeedbacks,
      resetFeedbackFilters,
      handleFeedback,
      deleteFeedback,
      // 配置
      configKey,
      config,
      configSaving,
      fetchConfig,
      saveConfig
    }
  }
})

app.use(ElementPlus)
app.mount('#app')
