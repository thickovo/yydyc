# 云裳记 (yydyc)

> 一款专为 Lolita 爱好者打造的裙子定金/尾款管理小程序。后端 Spring Boot + MySQL，前端微信小程序。

支持定尾模式和全款预售双模式，自动计算补款状态；支持裙子图片、小物配件、颜色、尺码、柜子分类管理。

## 技术栈

### 后端

| 技术 | 版本 |
|------|------|
| Spring Boot | 2.7.6 |
| MyBatis-Plus | 3.5.9 |
| MySQL | 8.0 |
| Swagger | 3.0 (springdoc-openapi) |
| Maven | 3.x |
| Lombok | - |

### 前端（微信小程序）

| 技术 | 说明 |
|------|------|
| 基础库 | 微信小程序 ≥ 3.0 |
| 自定义字体 | `youyou.ttf`（通过 `wx.loadFontFace` 远程加载） |
| 图片存储 | 后端本地磁盘 `D:/yydyc-images/` |

## 核心功能

1. **裙子管理**：支持 Lolita 裙子的增删改查、分页、多条件筛选（类别/类型/颜色/状态/关键字）
2. **双模式支持**：定尾模式（定金 + 尾款）和全款预售（总价 + 开售时间）
3. **补款状态自动计算**：今日补款 / 待补款 / 已补款 / 已过预售
4. **裙子图片**：上传到后端，URL 存库，小程序通过 `imageUrl` 字段回显
5. **小物配件**：发带 / KC / 头纱 / 礼帽 / 手袖 / 胸针 / 项链 / 耳饰 / 手套 / 过膝袜 / 裙撑 / 包袋 等，支持自定义添加
6. **颜色 + 尺码**：颜色调色板单选、尺码 picker 单选
7. **柜子分类管理**：自定义分类管理（Cabinet）
8. **尾款日历统计**：按日历视图查看尾款分布
9. **消费账本汇总**：消费统计与汇总
10. **补款提醒**：提前 1 / 3 / 7 天可配置

## 项目结构

```
yydyc/                              ← 项目根目录
├── yydyc/                          ← Spring Boot 后端
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/gao/yydyc/
│   │   │   │   ├── YydycApplication.java          # 项目启动类
│   │   │   │   ├── controller/                    # 控制器层（Wardrobe / Cabinet / Statistics / Image）
│   │   │   │   ├── entity/                        # 实体类（Wardrobe / Cabinet / CalendarItem）
│   │   │   │   ├── service/                       # 业务逻辑层
│   │   │   │   ├── mapper/                        # MyBatis-Plus Mapper
│   │   │   │   ├── config/                        # 配置类（Cors 等）
│   │   │   │   ├── common/                        # 通用类（Result 统一响应）
│   │   │   │   └── exception/                     # 异常处理（GlobalExceptionHandler）
│   │   │   └── resources/
│   │   │       ├── application.properties          # 默认配置（激活 dev profile）
│   │   │       ├── application-dev.properties     # 开发环境配置（数据库 / 静态资源 / 端口）
│   │   │       └── static/                        # 静态资源（字体 youyou.ttf 等）
│   ├── pom.xml
│   └── README.md                                   # 当前文件
│
└── yydyc_miniapp/                  ← 微信小程序前端
    ├── app.js                      # 全局入口；配置 isProd / baseUrl / 字体加载
    ├── app.json                    # 全局配置（页面注册、顶部导航）
    ├── app.wxss                    # 全局样式（pink 主题）
    ├── project.config.json         # 小程序项目配置
    ├── project.private.config.json # 本地私有配置（含 urlCheck:false）
    ├── sitemap.json
    ├── pages/                      # 页面目录
    │   ├── index/                  # 启动页（品牌展示）
    │   ├── home/                   # 首页（统计 + 功能入口）
    │   ├── list/                   # 衣橱列表（搜索 / 筛选）
    │   ├── add/                    # 添加裙子（含图片上传）
    │   ├── detail/                 # 裙子详情
    │   ├── edit/                   # 编辑裙子（含图片重新上传）
    │   └── logs/                   # 日志页（系统保留）
    ├── utils/
    │   ├── util.js                 # 时间格式化
    │   └── upload.js               # 图片选择 + 上传工具
    └── images/                     # 本地图片资源（启动页背景等）
```

## 快速启动（后端）

### 1. 创建数据库

连接 MySQL 8.0，执行：

```sql
CREATE DATABASE IF NOT EXISTS skirt_cabinet DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 修改数据库配置

打开 `src/main/resources/application-dev.properties`，修改数据库密码：

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/skirt_cabinet?useSSL=false&serverTimezone=Asia/Shanghai&characterEncoding=utf8
spring.datasource.username=root
spring.datasource.password=your_password

server.port=8080
server.address=0.0.0.0
```

### 3. 启动项目

运行 `YydycApplication.java` 启动类，或：

```bash
mvn spring-boot:run
```

### 4. 访问接口文档

启动成功后，浏览器访问：

```
http://localhost:8080/swagger-ui/index.html
```

## 快速启动（小程序）

### 1. 打开项目

用微信开发者工具导入 `yydyc_miniapp/` 目录，填入自己的 AppID。

### 2. 配置后端地址（开发 / 真机切换）

打开 `yydyc_miniapp/app.js`：

```js
globalData: {
  // false = 本机开发（localhost），true = 真机/局域网调试（192.168.18.62）
  isProd: false,
  baseUrl: 'http://localhost:8080'   // 默认值，onLaunch 会根据 isProd 重算
}
```

切换环境：把 `isProd` 改成 `true`（真机扫码调试）或 `false`（电脑模拟器）。

### 3. 关闭域名校验（开发期）

`yydyc_miniapp/project.private.config.json` 已默认设置 `urlCheck: false`，开发期间会忽略 downloadFile / request 合法域名检查。生产环境前需要在微信公众平台后台配置合法域名。

### 4. 编译预览

开发者工具点击「编译」，模拟器即可看到首页。

## 核心字段（Wardrobe 实体）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | Long | 主键，自增 |
| `userId` | String | 用户 ID（当前为 `test_user_001`） |
| `name` | String | 裙子名称 |
| `brand` | String | 品牌 |
| `type` | String | 类型（JSK / OP / SK / 衬衫 / 外套 / 背带裙 / 其他） |
| `color` | String | 颜色 HEX（如 `#FFB6C1`） |
| `size` | String | 尺码（XS / S / M / L / XL / 定制 / 均码） |
| `category` | String | 类别（裙子 / 袜子 / 鞋 / 配饰 / 其他） |
| `accessories` | String | 小物配件，逗号分隔（如 `发带,KC,头纱`） |
| `imageUrl` | String | 裙子图片 URL（上传到 `/api/image/upload` 后返回） |
| `totalPrice` | BigDecimal | 总价（定尾模式 = 定金 + 尾款） |
| `deposit` | BigDecimal | 定金 |
| `finalPayment` | BigDecimal | 尾款 |
| `finalStart` | LocalDate | 尾款开始日期 |
| `saleStart` | LocalDate | 全款预售的开售日期 |
| `purchaseLink` | String | 购买链接 |
| `note` | String | 备注 |
| `status` | Integer | 状态（0 = 待补款，1 = 已结清） |
| `isPaid` | Integer | 是否已支付（修改时间时重置为 0） |
| `remindBefore` | Integer | 提前几天提醒（1 / 3 / 7） |
| `cabinetId` | Long | 所属柜子 ID |

## API 接口清单

### 裙子管理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/wardrobe/add` | 新增裙子 |
| GET | `/api/wardrobe/list` | 裙子列表（分页 + 多条件筛选，必填 `userId`） |
| GET | `/api/wardrobe/detail/{id}` | 裙子详情 |
| PUT | `/api/wardrobe/update` | 更新裙子 |
| DELETE | `/api/wardrobe/delete/{id}` | 删除裙子 |

### 柜子管理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/cabinet/list` | 柜子列表 |
| POST | `/api/cabinet/add` | 新增柜子 |
| PUT | `/api/cabinet/update` | 更新柜子 |
| DELETE | `/api/cabinet/delete/{id}` | 删除柜子 |

### 图片上传接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/image/upload` | 上传图片（multipart/form-data，字段名 `file`），返回图片 URL |

### 统计接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/statistics/calendar` | 尾款日历统计 |
| GET | `/api/statistics/account` | 消费账本汇总 |

## 接口响应格式

```json
{
  "code": 200,
  "msg": "success",
  "data": <T>
}
```

- `code = 200` 表示成功
- `code = 500` 表示业务失败，`msg` 为错误信息
- `data` 为业务数据，泛型 `T` 根据接口而定

## 图片存储说明

- 上传接口接收 `multipart/form-data` 类型的 `file` 字段
- 支持格式：`jpg` / `jpeg` / `png`，大小 ≤ 5MB
- 存储路径：`D:/yydyc-images/{UUID}.{suffix}`
- 静态资源映射：`/images/**` → `classpath:/static/,file:D:/yydyc-images/`
- 返回 URL：`http://<serverName>:<port>/images/{filename}`，由后端 `request.getServerName()` 动态拼接，前端无需关心

## 接口文档说明

本项目使用 springdoc-openapi (Swagger 3.0) 生成在线接口文档。

- 访问地址：`http://localhost:8080/swagger-ui/index.html`
- 在 Swagger 页面中可以直接查看接口说明、请求参数、响应示例
- 支持在线调试接口

## 注意事项

1. **数据库版本**：请确保使用 MySQL 8.0+，低版本可能存在兼容性问题
2. **时区配置**：数据库连接 URL 中已配置 `serverTimezone=Asia/Shanghai`，如需修改请同步调整
3. **字符集**：建议使用 `utf8mb4` 字符集，避免 Emoji 等特殊字符存储异常
4. **端口占用**：默认端口 8080，如被占用请在配置文件中修改 `server.port`
5. **图片存储目录**：`D:/yydyc-images/` 目录需保证应用有写权限，目录不存在会自动创建
6. **Jackson 数字序列化**：`application.properties` 中开启了 `spring.jackson.generator.write-numbers-as-strings=true`，导致 `code` 字段会被序列化成字符串 `"200"`（非数字 `200`）。前端判断业务码时请用 `Number(code) === 200` 或 `code == 200`，避免严格相等失败
7. **小程序合法域名**：生产环境前需要在微信公众平台后台配置 `request` 和 `downloadFile` 合法域名
8. **开发调试**：开发者工具默认关闭合法域名校验（`project.private.config.json` 中 `urlCheck: false`），上线前请移除该配置

## 路线图 / TODO

- [ ] 心愿单功能（首页 `goToWish`）
- [ ] 尾款日历（首页 `goToCalendar`）
- [ ] 裙子小账本（首页 `goToAccount`）
- [ ] 多用户登录（当前使用固定 `userId=test_user_001`）
- [ ] 微信扫码登录接入
- [ ] 短信 / 微信模板消息提醒
- [ ] 历史数据中 `localhost` 图片 URL 迁移（执行 SQL：`UPDATE wardrobe SET image_url = REPLACE(image_url, 'http://localhost:8080', 'http://<your-domain>:8080') WHERE image_url LIKE 'http://localhost:8080%';`）

---

## 作者

幼幼的小熊 🧸
- GitHub：[https://github.com/thickovo](https://github.com/thickovo)
- 项目由个人独立开发，包含前后端完整实现
