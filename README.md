# 衣橱 (yydyc)

裙子定金/尾款管理工具，支持定尾模式和全款预售双模式，自动计算补款状态。

## 技术栈

| 技术 | 版本 |
|------|------|
| Spring Boot | 2.7.6 |
| MyBatis-Plus | 3.5.9 |
| MySQL | 8.0 |
| Swagger | 3.0 |
| Maven | 3.x |
| Git | - |

## 核心功能

1. **裙子管理**：支持 Lolita 裙子的增删改查，支持分页和多条件筛选
2. **双模式支持**：定尾模式（定金 + 尾款）和全款预售（总价 + 开售时间）
3. **补款状态自动计算**：今日补款 / 待补款 / 已补款
4. **柜子分类管理**：自定义分类管理
5. **尾款日历统计**：按日历视图查看尾款分布
6. **消费账本汇总**：消费统计与汇总

## 项目结构

```
yydyc/
├── src/
│   ├── main/
│   │   ├── java/com/gao/yydyc/
│   │   │   ├── YydycApplication.java          # 项目启动类
│   │   │   ├── controller/                    # 控制器层
│   │   │   ├── entity/                        # 实体类
│   │   │   ├── service/                       # 业务逻辑层
│   │   │   ├── mapper/                        # MyBatis-Plus Mapper
│   │   │   └── config/                        # 配置类
│   │   └── resources/
│   │       ├── application-dev.properties      # 开发环境配置
│   │       ├── application-prod.properties     # 生产环境配置
│   │       └── mapper/                         # XML Mapper
├── pom.xml
└── README.md
```

## 快速启动

### 1. 创建数据库

连接 MySQL 数据库，执行：

```sql
CREATE DATABASE IF NOT EXISTS skirt_cabinet DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 修改数据库配置

打开 `src/main/resources/application-dev.properties`，修改数据库密码：

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/skirt_cabinet?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
spring.datasource.username=root
spring.datasource.password=your_password
```

### 3. 启动项目

运行 `YydycApplication.java` 启动类，或使用 Maven 命令：

```bash
mvn spring-boot:run
```

### 4. 访问接口文档

启动成功后，浏览器访问：

```
http://localhost:8080/swagger-ui/index.html
```

## API 接口清单

### 裙子管理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/wardrobe/add | 新增裙子 |
| GET | /api/wardrobe/list | 裙子列表（分页 + 多条件筛选） |
| GET | /api/wardrobe/detail/{id} | 裙子详情 |
| PUT | /api/wardrobe/update | 更新裙子 |
| DELETE | /api/wardrobe/delete/{id} | 删除裙子 |

### 柜子管理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/cabinet/list | 柜子列表 |
| POST | /api/cabinet/add | 新增柜子 |
| PUT | /api/cabinet/update | 更新柜子 |
| DELETE | /api/cabinet/delete/{id} | 删除柜子 |

### 统计接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/statistics/calendar | 尾款日历统计 |
| GET | /api/statistics/account | 消费账本汇总 |

## 接口文档说明

本项目使用 Swagger 3.0 生成在线接口文档。

- 访问地址：`http://localhost:8080/swagger-ui/index.html`
- 在 Swagger 页面中可以直接查看接口说明、请求参数、响应示例
- 支持在线调试接口

## 注意事项

1. **数据库版本**：请确保使用 MySQL 8.0+，低版本可能存在兼容性问题
2. **时区配置**：数据库连接 URL 中已配置 `serverTimezone=Asia/Shanghai`，如需修改请同步调整
3. **字符集**：建议使用 `utf8mb4` 字符集，避免 Emoji 等特殊字符存储异常
4. **配置文件**：生产环境请使用 `application-prod.properties`，开发环境使用 `application-dev.properties`
5. **端口占用**：默认端口 8080，如被占用请在配置文件中修改 `server.port`

---

## 作者

幼幼的小熊 🧸
- GitHub：[https://github.com/thickovo](https://github.com/thickovo)
- 项目由个人独立开发，包含前后端完整实现
