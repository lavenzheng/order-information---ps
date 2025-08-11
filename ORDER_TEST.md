# 订单信息测试说明

## 测试目的
验证WebSocket客户端能够正确接收和展示订单信息。

## 测试步骤

### 1. 启动WebSocket服务器
确保WebSocket服务器正在运行，监听端口8080。

### 2. 连接WebSocket
1. 打开插件界面
2. 确保WebSocket连接状态为"已连接"
3. 检查控制台是否显示"WebSocket: 连接已建立"

### 3. 发送测试订单数据
服务器发送以下格式的消息：
```
order={"product_id":17154,"product_no":"CD25JUN8345","product_status":2,"product_status_name":"首稿设计","product_name":"CD25JUN8345","product_type":1,"product_type_name":"定制品","total_price":740.0,"total_pay":100.0,"first_pay":100.0,"second_pay":0.0,"third_pay":0.0,"last_pay":0.0,"pay_status_name":"定金已付","customize_info":"定制内容: 冠军戒指式如图1\n用钻: 常规+钻石\n颜色: 14k金色\n尺寸: 10\n后边部分设计: 如图5位置换成字母MSHCA\n前边部分设计: 如图4位置换成2025\n左边设计: 如图2\n右边设计: 如图3，图案右侧的文字Horace Pritchett换成James Faggins，图案不需要用钻石\n顶部设计: 如图1，但是主石换成CZ-08深紫蓝钻石","editor_name":"Haven","create_time":"2025-06-28T12:00:00","customer":{"customer_id":5213,"customer_no":"CUS004214","name":"","email":"","phone":"","billing_address":"","shipping_address":"","memo":"ins ：kevsworld45\n客服：Kevin Oliver\n\nkhagamin45@me.com\nKevin Hagamin"},"attachments":[{"url":"https://img.365d4u.com/order_track/media/2025_06/c9a515545ecc43cfa3bc03bbe467fa06.jpg","type":"image"},{"url":"https://img.365d4u.com/order_track/media/2025_06/e11df83639b4480e8fc3ac4673e7c848.jpg","type":"image"},{"url":"https://img.365d4u.com/order_track/media/2025_06/71d7de51d3e8482c8462672fdf341fa6.jpg","type":"image"},{"url":"https://img.365d4u.com/order_track/media/2025_06/5bd190df517242a4954a55dd977ce2d3.jpg","type":"image"},{"url":"https://img.365d4u.com/order_track/media/2025_06/e81f8a9109634aa9bc355fef1918e0cc.jpg","type":"image"},{"url":"https://img.365d4u.com/order_track/media/2025_06/68f3765e5d10945d7a5a2ab545f88ebc7.jpg","type":"image"}],"more_detail":{"title":"更多","url":"https://ordertrack.365d4u.com/query/products/17154"}}
```

### 4. 验证接收结果
检查以下内容：

#### 控制台日志
应该看到以下日志信息：
- `WebSocket: 收到消息: order={...}`
- `WebSocket: 检测到订单消息格式`
- `WebSocket: 尝试解析JSON字符串: {...}`
- `WebSocket: 成功解析订单数据`
- `WebSocket: 产品编号: CD25JUN8345`
- `WebSocket: 产品名称: CD25JUN8345`
- `收到订单数据: {...}`
- `订单信息已更新到界面: {...}`
- `订单详细信息: {...}`

#### 界面更新
1. 搜索框自动填充为"CD25JUN8345"
2. 订单信息区域显示产品信息
3. 显示成功通知："收到订单信息: CD25JUN8345"

#### 数据展示
- 产品信息：显示产品编号、名称、状态、类型等
- 支付信息：显示价格、付款状态等
- 客户信息：显示客户编号、备注等
- 附件：显示6张参考图片

### 5. 错误处理测试
发送格式错误的订单消息，验证错误处理：
```
order=invalid_json
```

应该看到错误日志和错误通知。

## 预期结果
1. WebSocket成功接收订单消息
2. JSON数据正确解析
3. 界面自动更新显示订单信息
4. 所有订单字段正确展示
5. 图片附件正常显示
6. 错误情况得到适当处理

## 故障排除
如果测试失败，检查：
1. WebSocket连接状态
2. 服务器消息格式
3. 浏览器控制台错误
4. 网络连接状态 