<template>
    <div class="websocket-section">
        <div @click="$emit('toggle')" class="collapsible-header">
            <div class="collapsible-title">WebSocket 连接</div>
            <span class="collapsible-arrow">{{ expanded ? '▼' : '▶' }}</span>
        </div>
        <div v-if="expanded" class="collapsible-content">
            <!-- 连接状态 -->
            <div class="connection-status">
                <div class="status-indicator" :class="connectionStatus">
                    {{ statusText }}
                </div>
            </div>
            
            <!-- 连接配置 -->
            <div class="connection-config">
                <div class="config-row">
                    <label>服务器地址:</label>
                    <input 
                        v-model="serverUrl" 
                        type="text" 
                        placeholder="ws://localhost:8080"
                        :disabled="isConnected" 
                    />
                </div>
                <div class="config-row">
                    <label>协议:</label>
                    <input 
                        v-model="protocol" 
                        type="text" 
                        placeholder="test-protocol"
                        :disabled="isConnected"
                    />
                </div>
            </div>
            
            <!-- 连接控制 -->
            <div class="connection-controls">
                <button 
                    @click="connect" 
                    :disabled="isConnected"
                    class="control-btn connect-btn"
                >
                    连接
                </button>
                <button 
                    @click="disconnect" 
                    :disabled="!isConnected"
                    class="control-btn disconnect-btn"
                >
                    断开
                </button>
            </div>
            
            <!-- 消息发送 -->
            <div class="message-section" v-if="isConnected">
                <div class="message-input-row">
                    <input 
                        v-model="messageInput" 
                        type="text" 
                        placeholder="输入消息内容..."
                        @keypress.enter="sendMessage"
                        class="message-input"
                    />
                    <button @click="sendMessage" class="control-btn send-btn">发送</button>
                </div>
                
                <!-- 快捷操作按钮 -->
                <div class="quick-actions">
                    <button @click="sendEcho" class="control-btn action-btn">Echo</button>
                    <button @click="toggleRandom" class="control-btn action-btn" :class="{ active: randomEnabled }">
                        {{ randomEnabled ? '关闭随机数' : '开启随机数' }}
                    </button>
                    <button @click="toggleFast" class="control-btn action-btn" :class="{ active: fastEnabled }">
                        {{ fastEnabled ? '关闭快速计数' : '开启快速计数' }}
                    </button>
                </div>
            </div>
            
            <!-- 消息日志 -->
            <div class="message-log-section">
                <div class="log-header">
                    <h4>消息日志</h4>
                    <button @click="clearLog" class="control-btn clear-btn">清空</button>
                </div>
                <div class="message-log" ref="messageLog">
                    <div 
                        v-for="(msg, index) in messageLog" 
                        :key="index" 
                        :class="['log-item', msg.type]"
                    >
                        <span class="log-time">{{ msg.time }}</span>
                        <span class="log-content">{{ msg.content }}</span>
                    </div>
                </div>
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
            messageInput: '',
            messageLog: [],
            randomEnabled: false,
            fastEnabled: false,
            maxLogEntries: 100
        };
    },
    methods: {
        // 连接到WebSocket服务器
        connect() {
            if (!this.serverUrl.trim()) {
                this.addLog('请输入服务器地址', 'error');
                return;
            }

            try {
                this.updateStatus('connecting', '连接中...');
                
                // 创建WebSocket连接
                this.ws = new WebSocket(this.serverUrl.trim(), this.protocol.trim());
                
                // 连接建立
                this.ws.onopen = (event) => {
                    this.isConnected = true;
                    this.updateStatus('connected', '已连接');
                    this.addLog('WebSocket连接已建立', 'system');
                };
                
                // 接收消息
                this.ws.onmessage = (event) => {
                    this.addLog(`收到: ${event.data}`, 'received');
                };
                
                // 连接关闭
                this.ws.onclose = (event) => {
                    this.isConnected = false;
                    this.randomEnabled = false;
                    this.fastEnabled = false;
                    this.updateStatus('disconnected', '连接已断开');
                    this.addLog(`连接已断开 (代码: ${event.code})`, 'system');
                };
                
                // 连接错误
                this.ws.onerror = (error) => {
                    this.addLog(`连接错误: ${error.message || '未知错误'}`, 'error');
                    this.updateStatus('disconnected', '连接失败');
                };
                
            } catch (error) {
                this.addLog(`连接失败: ${error.message}`, 'error');
                this.updateStatus('disconnected', '连接失败');
            }
        },
        
        // 断开WebSocket连接
        disconnect() {
            if (this.ws && this.isConnected) {
                this.ws.close();
                this.ws = null;
                this.isConnected = false;
                this.randomEnabled = false;
                this.fastEnabled = false;
            }
        },
        
        // 发送自定义消息
        sendMessage() {
            const message = this.messageInput.trim();
            if (!message || !this.isConnected) return;
            
            this.ws.send(message);
            this.addLog(`发送: ${message}`, 'sent');
            this.messageInput = '';
        },
        
        // 发送Echo消息
        sendEcho() {
            if (!this.isConnected) return;
            
            const message = this.messageInput.trim() || 'Hello World';
            const echoMessage = `echo=${message}`;
            
            this.ws.send(echoMessage);
            this.addLog(`发送 Echo: ${echoMessage}`, 'sent');
        },
        
        // 切换随机数生成
        toggleRandom() {
            if (!this.isConnected) return;
            
            this.randomEnabled = !this.randomEnabled;
            const message = `rand=${this.randomEnabled ? 'on' : 'off'}`;
            
            this.ws.send(message);
            this.addLog(`随机数 ${this.randomEnabled ? '开启' : '关闭'}: ${message}`, 'sent');
        },
        
        // 切换快速计数
        toggleFast() {
            if (!this.isConnected) return;
            
            this.fastEnabled = !this.fastEnabled;
            const message = `fast=${this.fastEnabled ? 'on' : 'off'}`;
            
            this.ws.send(message);
            this.addLog(`快速计数 ${this.fastEnabled ? '开启' : '关闭'}: ${message}`, 'sent');
        },
        
        // 更新连接状态
        updateStatus(status, text) {
            this.connectionStatus = status;
            this.statusText = text;
        },
        
        // 添加日志条目
        addLog(content, type = 'system') {
            const timestamp = new Date().toLocaleTimeString();
            this.messageLog.push({
                time: timestamp,
                content: content,
                type: type
            });
            
            // 限制日志条目数量
            if (this.messageLog.length > this.maxLogEntries) {
                this.messageLog.shift();
            }
            
            // 滚动到底部
            this.$nextTick(() => {
                if (this.$refs.messageLog) {
                    this.$refs.messageLog.scrollTop = this.$refs.messageLog.scrollHeight;
                }
            });
        },
        
        // 清空日志
        clearLog() {
            this.messageLog = [];
        }
    },
    
    beforeDestroy() {
        // 组件销毁前断开连接
        this.disconnect();
    }
};
</script> 