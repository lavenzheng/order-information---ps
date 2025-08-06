# 订单查询系统 - Adobe Photoshop UXP 插件

一个基于 Vue.js 开发的 Adobe Photoshop UXP 插件，用于查询和显示订单信息。

## 功能特性

- 🔍 产品编号搜索
- 📋 结构化信息展示（产品信息、支付信息、客户信息）
- 🎯 可折叠的信息区域
- 🖼️ 图片附件预览
- 🌐 外部链接支持
- 📱 响应式设计

## 项目结构

```
ui-vue-starter/
├── src/
│   ├── components/          # Vue组件
│   │   ├── ProductInfo.vue  # 产品信息组件
│   │   ├── PaymentInfo.vue  # 支付信息组件
│   │   └── CustomerInfo.vue # 客户信息组件
│   ├── api/                 # API服务
│   │   └── productApi.js    # 产品API服务
│   ├── utils/               # 工具函数
│   │   ├── formatters.js    # 格式化工具
│   │   └── uxpUtils.js      # UXP工具函数
│   ├── styles/              # 样式文件
│   │   └── main.css         # 主样式文件
│   ├── config/              # 配置文件
│   │   └── index.js         # 应用配置
│   ├── hello.vue            # 主组件
│   └── main.js              # 应用入口
├── plugin/                  # UXP插件文件
│   ├── manifest.json        # 插件清单
│   ├── index.html           # 插件HTML
│   └── icons/               # 插件图标
├── dist/                    # 构建输出
├── webpack.config.js        # Webpack配置
├── package.json             # 项目配置
└── README.md               # 项目文档
```

## 开发指南

### 环境要求

- Node.js 16+
- Adobe Photoshop 2022+
- UXP Developer Tools

### 安装依赖

```bash
npm install
```

### 开发命令

```bash
# 构建项目
npm run build

# 监听文件变化并自动构建
npm run watch

# 加载插件到Photoshop
npm run uxp:load

# 重新加载插件
npm run uxp:reload

# 调试插件
npm run uxp:debug
```

### 项目架构

#### 组件化设计
- **ProductInfo.vue**: 产品信息展示组件
- **PaymentInfo.vue**: 支付信息展示组件  
- **CustomerInfo.vue**: 客户信息展示组件

#### API服务层
- **productApi.js**: 封装所有产品相关的API调用
- 支持错误处理和重试机制
- 统一的响应格式处理

#### 工具函数
- **formatters.js**: 日期、货币、地址等格式化函数
- **uxpUtils.js**: UXP环境相关的工具函数

#### 样式管理
- **main.css**: 集中管理所有样式
- 使用CSS类名替代内联样式
- 响应式设计支持

#### 配置管理
- **config/index.js**: 集中管理应用配置
- 支持环境变量和功能开关

## API接口

### 产品列表接口
- **URL**: `https://ordertrack.365d4u.com/api/product/list`
- **方法**: GET
- **参数**: 
  - `page`: 页码
  - `page_size`: 每页数量
  - `attribute`: 属性
  - `upload`: 上传状态

## 开发规范

### 代码规范
- 使用ES6+语法
- 组件名使用PascalCase
- 文件名使用camelCase
- 常量使用UPPER_SNAKE_CASE

### 组件开发
- 每个组件都有明确的职责
- 使用props进行数据传递
- 使用events进行事件通信
- 保持组件的可复用性

### 样式规范
- 使用CSS类名而非内联样式
- 遵循BEM命名规范
- 响应式设计优先

## 部署说明

1. 构建项目：`npm run build`
2. 加载插件：`npm run uxp:load`
3. 在Photoshop中启用插件

## 故障排除

### 常见问题

1. **Node.js版本兼容性**
   ```bash
   $env:NODE_OPTIONS="--openssl-legacy-provider"; npm run build
   ```

2. **插件加载失败**
   - 检查Photoshop版本是否支持UXP
   - 确认UXP Developer Tools已安装
   - 检查manifest.json配置

3. **API调用失败**
   - 检查网络连接
   - 确认API地址正确
   - 查看控制台错误信息

## 更新日志

### v1.0.0
- 初始版本发布
- 基础搜索功能
- 结构化信息展示
- 可折叠区域
- 图片预览功能

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License
