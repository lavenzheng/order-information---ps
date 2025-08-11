<template>
    <!-- 隐藏界面，只保留必要的状态指示 -->
    <div class="websocket-section" style="display: none;">
        <div class="connection-status">
            <div class="status-indicator" :class="connectionStatus">
                {{ statusText }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'WebSocketClient',
    props: {
        expanded: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            ws: null,
            isConnected: false,
            connectionStatus: 'disconnected',
            statusText: '未连接',
            serverUrl: 'ws://localhost:8080',
            protocol: 'test-protocol',
            autoReconnect: true,
            reconnectInterval: 5000, // 5秒重连间隔
            reconnectTimer: null
        };
    },
    mounted() {
        // 组件挂载后自动连接
        this.$nextTick(() => {
            this.autoConnect();
        });
    },
    methods: {
        // 自动连接方法
        autoConnect() {
            console.log('WebSocket: 开始自动连接...');
            this.connect();
        },
        
        // 连接到WebSocket服务器
        connect() {
            if (!this.serverUrl.trim()) {
                this.logToConsole('请输入服务器地址', 'error');
                return;
            }

            try {
                this.updateStatus('connecting', '连接中...');
                this.logToConsole('WebSocket: 正在连接到服务器...', 'system');
                
                // 创建WebSocket连接
                this.ws = new WebSocket(this.serverUrl.trim(), this.protocol.trim());
                
                // 连接建立
                this.ws.onopen = (event) => {
                    this.isConnected = true;
                    this.updateStatus('connected', '已连接');
                    this.logToConsole('WebSocket: 连接已建立', 'system');
                    this.logToConsole(`WebSocket: 服务器地址: ${this.serverUrl}`, 'system');
                    this.logToConsole(`WebSocket: 协议: ${this.protocol}`, 'system');
                    
                    // 连接成功后自动发送插件ID
                    this.sendPluginId();
                    
                    // 清除重连定时器
                    if (this.reconnectTimer) {
                        clearTimeout(this.reconnectTimer);
                        this.reconnectTimer = null;
                    }
                };
                
                // 接收消息
                this.ws.onmessage = (event) => {
                    this.logToConsole(`WebSocket: 收到消息: ${event.data}`, 'received');
                    
                    // 检查是否是订单消息
                    if (event.data.startsWith('order=')) {
                        this.logToConsole(`WebSocket: 检测到订单消息格式`, 'received');
                    }
                    
                    // 解析订单消息
                    this.parseOrderMessage(event.data);
                };
                
                // 连接关闭
                this.ws.onclose = (event) => {
                    this.isConnected = false;
                    this.updateStatus('disconnected', '连接已断开');
                    this.logToConsole(`WebSocket: 连接已断开 (代码: ${event.code})`, 'system');
                    
                    // 自动重连
                    if (this.autoReconnect) {
                        this.scheduleReconnect();
                    }
                };
                
                // 连接错误
                this.ws.onerror = (error) => {
                    this.logToConsole(`WebSocket: 连接错误: ${error.message || '未知错误'}`, 'error');
                    this.updateStatus('disconnected', '连接失败');
                };
                
            } catch (error) {
                this.logToConsole(`WebSocket: 连接失败: ${error.message}`, 'error');
                this.updateStatus('disconnected', '连接失败');
                
                // 连接失败后也尝试重连
                if (this.autoReconnect) {
                    this.scheduleReconnect();
                }
            }
        },
        
        // 安排重连
        scheduleReconnect() {
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
            }
            
            this.logToConsole(`WebSocket: ${this.reconnectInterval/1000}秒后尝试重连...`, 'system');
            this.reconnectTimer = setTimeout(() => {
                this.logToConsole('WebSocket: 开始重连...', 'system');
                this.connect();
            }, this.reconnectInterval);
        },
        
        // 断开WebSocket连接
        disconnect() {
            if (this.ws && this.isConnected) {
                this.autoReconnect = false; // 手动断开时禁用自动重连
                this.ws.close();
                this.ws = null;
                this.isConnected = false;
                
                // 清除重连定时器
                if (this.reconnectTimer) {
                    clearTimeout(this.reconnectTimer);
                    this.reconnectTimer = null;
                }
                
                this.logToConsole('WebSocket: 连接已手动断开', 'system');
            }
        },
        
        // 发送自定义消息
        sendMessage(message) {
            if (!this.isConnected) {
                this.logToConsole('WebSocket: 未连接，无法发送消息', 'error');
                return;
            }
            
            try {
                this.ws.send(message);
                this.logToConsole(`WebSocket: 发送消息: ${message}`, 'sent');
            } catch (error) {
                this.logToConsole(`WebSocket: 发送消息失败: ${error.message}`, 'error');
            }
        },
        
        // 更新连接状态
        updateStatus(status, text) {
            this.connectionStatus = status;
            this.statusText = text;
            
            // 通知父组件状态变化
            this.$emit('statusChanged', status);
        },
        
        // 输出到控制台
        logToConsole(content, type = 'system') {
            const timestamp = new Date().toLocaleTimeString();
            const prefix = `[${timestamp}]`;
            
            switch (type) {
                case 'error':
                    console.error(`${prefix} ${content}`);
                    break;
                case 'warning':
                    console.warn(`${prefix} ${content}`);
                    break;
                case 'sent':
                    console.log(`${prefix} 📤 ${content}`);
                    break;
                case 'received':
                    console.log(`${prefix} 📥 ${content}`);
                    break;
                default:
                    console.log(`${prefix} ℹ️ ${content}`);
            }
        },
        
        // 发送插件ID
        sendPluginId() {
            if (!this.isConnected || !this.ws) return;
            
            try {
                const pluginId = 'com.adobe.uxp.starter.vue';
                this.ws.send(pluginId);
                this.logToConsole(`WebSocket: 发送插件ID: ${pluginId}`, 'sent');
            } catch (error) {
                this.logToConsole(`WebSocket: 发送插件ID失败: ${error.message}`, 'error');
            }
        },

        // 解析订单消息
        parseOrderMessage(message) {
            if (message.startsWith('order=')) {
                try {
                    // 只解析"="后面的JSON数据，不包含"="符号
                    const jsonString = message.substring(6); // 去掉"order="前缀
                    this.logToConsole(`WebSocket: 尝试解析JSON字符串: ${jsonString}`, 'received');
                    
                    const orderData = JSON.parse(jsonString);
                    this.logToConsole(`WebSocket: 成功解析订单数据`, 'received');
                    this.logToConsole(`WebSocket: 产品编号: ${orderData.product_no}`, 'received');
                    this.logToConsole(`WebSocket: 产品名称: ${orderData.product_name}`, 'received');
                    
                    // 发出事件，传递解析后的订单数据
                    this.$emit('orderMessageReceived', orderData);
                } catch (e) {
                    this.logToConsole(`WebSocket: 解析订单消息失败: ${e.message}`, 'error');
                    this.logToConsole(`WebSocket: 原始消息: ${message}`, 'error');
                }
            }
        }
    },
    
    beforeDestroy() {
        // 组件销毁前断开连接
        this.autoReconnect = false;
        this.disconnect();
        
        // 清除重连定时器
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        
        this.logToConsole('WebSocket: 组件销毁，连接已清理', 'system');
    }
};
</script> 