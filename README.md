# Vue UXP 插件 - 产品订单查询系统

这是一个基于Vue.js的Adobe Photoshop UXP插件，用于查询和管理产品订单信息。

## 🚀 项目特性

- **模块化架构**: 采用组件化设计，代码结构清晰
- **响应式设计**: 支持不同屏幕尺寸的适配
- **错误处理**: 完善的错误处理和用户反馈机制
- **性能优化**: 防抖、节流等性能优化技术
- **可扩展性**: 易于添加新功能和修改现有功能

## 📁 项目结构

```
src/
├── api/                    # API服务层
│   └── productApi.js      # 产品相关API调用
├── components/             # Vue组件
│   ├── ProductInfo.vue    # 产品信息组件
│   ├── PaymentInfo.vue    # 支付信息组件
│   └── CustomerInfo.vue   # 客户信息组件
├── config/                 # 配置文件
│   └── index.js           # 应用配置
├── utils/                  # 工具函数
│   ├── formatters.js      # 格式化工具
│   └── uxpUtils.js        # UXP相关工具
├── styles/                 # 样式文件
│   └── main.css           # 主样式文件
├── hello.vue              # 主组件
└── main.js                # 应用入口
```

## 🛠️ 技术栈

- **Vue.js 2.6.12**: 前端框架
- **Webpack 4**: 构建工具
- **UXP**: Adobe插件开发框架
- **CSS3**: 样式和动画

## 🔧 安装和运行

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发模式
npm run watch

# 构建项目
npm run build

# 加载插件到UXP
npm run uxp:load

# 重新加载插件
npm run uxp:reload

# 调试插件
npm run uxp:debug
```

### 生产环境

```bash
# 构建生产版本
npm run build

# 加载插件
npm run uxp:load
```

## 📋 功能特性

### 核心功能
- ✅ 产品编号搜索
- ✅ 产品信息展示
- ✅ 支付信息管理
- ✅ 客户信息查看
- ✅ 图片预览功能

### 用户体验
- ✅ 响应式设计
- ✅ 加载状态提示
- ✅ 错误信息反馈
- ✅ 可折叠信息面板
- ✅ 平滑动画效果

### 技术特性
- ✅ 模块化组件设计
- ✅ API重试机制
- ✅ 防抖搜索优化
- ✅ 错误边界处理
- ✅ 配置化管理

## 🎨 组件说明

### ProductInfo.vue
产品信息展示组件，包含：
- 产品基本信息
- 定制信息解析
- 附件图片预览
- 更多详情链接

### PaymentInfo.vue
支付信息展示组件，包含：
- 总价和已付金额
- 分期付款详情
- 支付状态显示
- 剩余金额计算

### CustomerInfo.vue
客户信息展示组件，包含：
- 客户基本信息
- 联系方式（邮箱、电话）
- 地址信息
- 备注信息

## ⚙️ 配置说明

### API配置
```javascript
api: {
    baseUrl: 'https://ordertrack.365d4u.com/api',
    request: {
        timeout: 10000,    // 请求超时时间
        retryCount: 3,     // 重试次数
        retryDelay: 1000   // 重试延迟
    }
}
```

### UI配置
```javascript
ui: {
    defaultExpanded: {
        productInfo: true,   // 默认展开产品信息
        customerInfo: false, // 默认收起客户信息
        paymentInfo: false   // 默认收起支付信息
    }
}
```

### 功能配置
```javascript
features: {
    enableImagePreview: true,    // 启用图片预览
    enableExternalLinks: true,   // 启用外部链接
    search: {
        caseSensitive: false,    // 搜索是否区分大小写
        minSearchLength: 1       // 最小搜索字符数
    }
}
```

## 🔄 优化记录

### 架构优化
- [x] 组件化重构，提高代码复用性
- [x] API服务层分离，统一错误处理
- [x] 工具函数模块化，便于维护
- [x] 配置文件集中管理

### 性能优化
- [x] 防抖搜索，减少API调用
- [x] 图片懒加载，提升加载速度
- [x] 组件按需加载，减少初始包大小
- [x] CSS动画优化，提升用户体验

### 用户体验优化
- [x] 响应式设计，适配不同屏幕
- [x] 加载状态提示，提升交互体验
- [x] 错误信息友好化，便于用户理解
- [x] 动画效果增强，提升视觉体验

## 🐛 问题排查

### 常见问题

1. **插件无法加载**
   - 检查UXP开发者工具是否正确安装
   - 确认插件manifest.json配置正确

2. **API请求失败**
   - 检查网络连接
   - 确认API地址配置正确
   - 查看控制台错误信息

3. **样式显示异常**
   - 检查CSS文件是否正确加载
   - 确认浏览器兼容性

### 调试方法

```bash
# 查看构建日志
npm run build

# 查看插件日志
npm run uxp:debug

# 重新加载插件
npm run uxp:reload
```

## 📝 开发指南

### 添加新组件
1. 在`src/components/`目录下创建新的Vue组件
2. 在主组件中导入并使用
3. 添加相应的样式类

### 修改API配置
1. 编辑`src/config/index.js`文件
2. 修改API相关配置
3. 重启开发服务器

### 自定义样式
1. 编辑`src/styles/main.css`文件
2. 添加新的CSS类
3. 在组件中使用新的样式类

## 📄 许可证

本项目仅供学习和开发使用。

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目。

---

**版本**: 1.0.0  
**最后更新**: 2025-01-06  
**维护者**: AI Assistant

## WebSocket 客户端功能说明

### 功能特性
- **自动连接**: 插件启动后自动连接到WebSocket服务器
- **隐藏界面**: WebSocket客户端界面已隐藏，所有操作通过控制台进行
- **状态栏显示**: 底部状态栏实时显示网络连接状态和连接时间
- **自动重连**: 连接断开后自动重连（5秒间隔）
- **插件ID发送**: 连接成功后自动发送插件ID `com.adobe.uxp.starter.vue`
- **订单消息解析**: 自动解析以"order="开头的消息，提取JSON数据并更新订单信息区
- **通知系统**: 收到订单消息时显示右上角通知提示

### 使用方法
插件启动后，WebSocket客户端会自动连接到 `ws://localhost:8080`，使用协议 `test-protocol`。

#### 控制台命令
在浏览器控制台中可以使用以下命令与WebSocket交互：

```javascript
// 查看所有可用命令
wsConsole.help()

// 发送自定义消息
wsConsole.send("您的消息")

// 发送Echo消息
wsConsole.echo("Hello World")

// 开启/关闭随机数生成
wsConsole.randomOn()
wsConsole.randomOff()

// 开启/关闭快速计数
wsConsole.fastOn()
wsConsole.fastOff()

// 查看连接状态
wsConsole.status()
```

#### 状态栏信息
- **网络状态**: 显示当前WebSocket连接状态（未连接/连接中/已连接）
- **连接时间**: 显示最近一次成功连接的时间

#### 服务器协议
支持以下消息格式：
- `echo=消息内容` - 服务器回显消息
- `rand=on/off` - 开启/关闭随机数生成
- `fast=on/off` - 开启/关闭快速计数
- `order={"product_no":"产品编号","order_no":"订单号","customer_name":"客户姓名"}` - 订单信息消息

#### 订单消息处理
当收到以"order="开头的消息时：
1. 自动解析JSON数据
2. 如果包含`product_no`字段，自动填入搜索框并执行搜索
3. 显示右上角通知提示
4. 在控制台输出解析结果

#### 通知系统
插件内置通知系统，支持以下类型：
- **信息通知** (蓝色): 一般信息提示
- **成功通知** (绿色): 操作成功提示  
- **警告通知** (橙色): 警告信息提示
- **错误通知** (红色): 错误信息提示

通知会自动显示在右上角，3秒后自动消失，也可手动关闭。

### 注意事项
1. 确保WebSocket服务器在 `ws://localhost:8080` 运行
2. 服务器需要支持 `test-protocol` 协议
3. 所有连接日志都会输出到浏览器控制台
4. 界面已隐藏，所有操作通过控制台进行

### 技术实现
- 使用原生WebSocket API
- Vue.js组件生命周期管理连接状态
- 自动重连机制
- 事件驱动的状态通知
- 控制台友好的日志输出

### 故障排除
如果连接失败：
1. 检查WebSocket服务器是否运行
2. 确认服务器地址和协议是否正确
3. 查看浏览器控制台的错误日志
4. 使用 `wsConsole.status()` 检查连接状态
