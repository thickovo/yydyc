# 衣橱 - 后端



## 技术栈

- Java 17
- Spring Boot 2.7.6
- MyBatis-Plus 3.5.9
- MySQL 8.0
- Swagger 3.0

## 功能

- 裙子 CRUD（增删改查）
- 多条件筛选（类别、类型、颜色、状态、关键词）
- 柜子管理（自定义分类）
- 尾款日历统计
- 裙子小账本统计
- 全款预售 / 定尾模式
- 小物清单

## 运行

1. 创建数据库 `skirt_cabinet`
2. 执行 `docs/schema.sql`（如果有）
3. 修改 `application-dev.properties` 中的数据库密码
4. 运行 `YydycApplication.java`

## 接口文档

启动后访问：`http://localhost:8080/swagger-ui/index.html`

## 环境配置

- `application.properties`：主配置
- `application-dev.properties`：开发环境
- `application-prod.properties`：生产环境（待建）

## 作者

幼幼的小熊 🧸