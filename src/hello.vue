<template>
    <div class="plugin-container">
        <!-- WebSocket 客户端 -->
        <WebSocketClient 
            ref="websocketClient"
            :expanded="websocketExpanded"
            @toggle="toggleWebSocket"
            @statusChanged="handleWebSocketStatusChange"
            @orderMessageReceived="handleOrderMessageReceived" />
        
        <!-- 搜索区域 -->
        <div class="search-area">
            <sp-textfield 
                :value="inputText"
                @input="handleInput"
                placeholder="请输入产品编号..."
                label="产品编号搜索"
                class="search-input">
            </sp-textfield>
            <sp-button v-on:click="searchProduct" class="search-button">搜索</sp-button>
            <sp-button v-on:click="clearInput" class="clear-button">清空</sp-button>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-state">
            <sp-body>正在搜索中...</sp-body>
        </div>
        
        <!-- 错误状态 -->
        <div v-if="errorMessage" class="error-state">
            <sp-body>{{ errorMessage }}</sp-body>
        </div>
        
        <!-- 搜索结果显示 -->
        <div v-if="searchResult" class="search-results-container">
            <div v-if="searchResult.length === 0" class="no-results">
                未找到匹配的产品编号
            </div>
            <div v-else class="results-wrapper">
                <div v-for="product in searchResult" :key="product.product_id" class="product-card">
                    <!-- 产品信息 -->
                    <ProductInfo 
                        :product="product" 
                        :expanded="productInfoExpanded"
                        @toggle="toggleProductInfo"
                        @openImage="openImageWithIndex" />
                    
                    <!-- 支付信息 -->
                    <PaymentInfo 
                        :product="product" 
                        :expanded="paymentInfoExpanded"
                        @toggle="togglePaymentInfo" />
                    
                    <!-- 客户信息 -->
                    <CustomerInfo 
                        :product="product" 
                        :expanded="customerInfoExpanded"
                        @toggle="toggleCustomerInfo" />
                </div>
            </div>
        </div>
        
        <!-- 图片预览模态框 -->
        <div v-if="showImagePreview" class="image-preview-modal" @click="closeImagePreview">
            <div class="image-preview-container" @click.stop>
                <!-- 关闭按钮 -->
                <button class="close-button" @click="closeImagePreview">&times;</button>
                
                <!-- 上一张按钮 -->
                <button 
                    v-if="currentImageList.length > 1" 
                    class="nav-button prev-button" 
                    @click="prevImage"
                    :disabled="currentImageIndex === 0"
                >
                    ‹
                </button>
                
                <!-- 下一张按钮 -->
                <button 
                    v-if="currentImageList.length > 1" 
                    class="nav-button next-button" 
                    @click="nextImage"
                    :disabled="currentImageIndex === currentImageList.length - 1"
                >
                    ›
                </button>
                
                <!-- 图片显示 -->
                <div class="image-display">
                    <img 
                        :src="currentImageUrl" 
                        :alt="`图片 ${currentImageIndex + 1}`"
                        class="preview-image"
                        @error="handlePreviewImageError"
                        @load="handlePreviewImageLoad"
                    />
                </div>
                
                <!-- 图片信息区域 -->
                <div class="image-info">
                    <!-- 左侧：图片尺寸信息 -->
                    <div class="image-size-info" v-if="currentImageSize">
                        {{ currentImageSize }}
                    </div>
                    
                    <!-- 中间：图片计数器 -->
                    <span class="image-counter">{{ currentImageIndex + 1 }} / {{ currentImageList.length }}</span>
                    
                    <!-- 右侧：用浏览器打开按钮 -->
                    <button class="browser-open-btn" @click="openCurrentImageInBrowser">
                        用浏览器打开
                    </button>
                </div>
            </div>
        </div>
        
        <!-- 状态栏 -->
        <div class="status-bar">
            <!-- 网络连接状态圆点 - 固定在最左边 -->
            <div class="status-dot-container">
                <div class="status-dot" :class="websocketStatus"></div>
            </div>
            <!-- 通知信息区域 - 占据剩余空间 -->
            <div class="status-info-container">
                <span class="order-info">{{ orderInfoText || statusNotification }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import ProductInfo from './components/ProductInfo.vue';
import PaymentInfo from './components/PaymentInfo.vue';
import CustomerInfo from './components/CustomerInfo.vue';
import WebSocketClient from './components/WebSocketClient.vue';
import { searchProductByNo, preloadProductData, clearProductCache } from './api/productApi';
import { openExternalUrl } from './utils/uxpUtils';
import config from './config';

export default {
    name: 'ProductSearch',
    components: {
        ProductInfo,
        PaymentInfo,
        CustomerInfo,
        WebSocketClient
    },
    data() {
        return {
            inputText: '',
            searchResult: null,
            isLoading: false,
            errorMessage: '',
            productInfoExpanded: config.ui.defaultExpanded.productInfo,
            customerInfoExpanded: config.ui.defaultExpanded.customerInfo,
            paymentInfoExpanded: config.ui.defaultExpanded.paymentInfo,
            // 图片预览相关
            showImagePreview: false,
            currentImageList: [],
            currentImageIndex: 0,
            currentImageSize: null,
            // WebSocket相关
            websocketExpanded: true,
            // 状态栏相关
            websocketStatus: 'disconnected',
            orderInfoText: '',
            // 搜索优化相关
            isDataPreloaded: false
        };
    },
    computed: {
        currentImageUrl() {
            if (this.currentImageList.length === 0 || this.currentImageIndex >= this.currentImageList.length) {
                return '';
            }
            return this.currentImageList[this.currentImageIndex];
        }
    },
    async mounted() {
        // 添加键盘事件监听
        document.addEventListener('keydown', this.handleKeydown);
        
        // 添加WebSocket控制台功能
        this.setupWebSocketConsole();
        
        // 添加通知系统
        this.setupNotificationSystem();
        
        // 预加载产品数据以提高首次搜索速度
        this.preloadData();
    },
    methods: {
        // 显示状态栏通知
        showStatusNotification(message, type = 'info', duration = 3000) {
            this.orderInfoText = message;
            
            // 自动清除通知
            if (duration > 0) {
                setTimeout(() => {
                    this.clearStatusNotification();
                }, duration);
            }
        },
        
        // 清除状态栏通知
        clearStatusNotification() {
            this.orderInfoText = '';
        },
        
        // 预加载产品数据
        async preloadData() {
            try {
                console.log('开始预加载产品数据...');
                await preloadProductData();
                this.isDataPreloaded = true;
                console.log('产品数据预加载完成');
                
                this.showStatusNotification('产品数据已预加载', 'success', 3000);
            } catch (error) {
                console.warn('产品数据预加载失败:', error);
                this.isDataPreloaded = false;
                
                this.showStatusNotification('产品数据预加载失败', 'error', 3000);
            }
        },
        
        // 切换WebSocket区域展开状态
        toggleWebSocket() {
            this.websocketExpanded = !this.websocketExpanded;
        },
        
        // 处理从WebSocket接收到的订单数据
        handleOrderDataReceived(orderData) {
            console.log('收到订单数据:', orderData);
            
            // 如果订单数据包含产品编号，可以自动搜索
            if (orderData.product_no) {
                this.inputText = orderData.product_no;
                this.searchProduct();
            }
            
            // 显示成功通知
            this.showStatusNotification('收到新的订单数据', 'success', 3000);
        },
        
        // 处理输入变化
        handleInput(event) {
            this.inputText = event.target.value;
        },
        
        clearInput() {
            this.inputText = '';
            this.searchResult = null;
            this.errorMessage = '';
        },
        
        // 搜索产品（优化版本）
        async searchProduct() {
            if (!this.inputText.trim()) {
                this.errorMessage = '请输入产品编号';
                return;
            }
            
            this.isLoading = true;
            this.errorMessage = '';
            this.searchResult = null;
            
            try {
                console.log(`开始搜索产品编号: ${this.inputText.trim()}`);
                
                const result = await searchProductByNo(this.inputText.trim(), true);
                this.searchResult = result;
                
                if (this.searchResult.length === 0) {
                    this.errorMessage = '未找到匹配的产品编号';
                }
            } catch (error) {
                console.error('搜索失败:', error);
                this.errorMessage = error.message || '搜索失败，请重试';
            } finally {
                this.isLoading = false;
            }
        },
        
        toggleProductInfo() {
            this.productInfoExpanded = !this.productInfoExpanded;
        },
        
        toggleCustomerInfo() {
            this.customerInfoExpanded = !this.customerInfoExpanded;
        },
        
        togglePaymentInfo() {
            this.paymentInfoExpanded = !this.paymentInfoExpanded;
        },
        
        // 图片预览方法
        openImageWithIndex(imageData) {
            if (!imageData) return;
            
            // 处理不同的参数格式
            let imageUrl, imageList, imageIndex;
            
            if (typeof imageData === 'string') {
                // 兼容原来的字符串格式
                this.openImage(imageData);
                return;
            } else if (imageData.url) {
                // 新的对象格式
                imageUrl = imageData.url;
                imageIndex = imageData.index || 0;
                
                // 从当前产品中获取图片列表
                const currentProduct = this.searchResult && this.searchResult[0];
                if (currentProduct && currentProduct.attachments) {
                    imageList = currentProduct.attachments
                        .filter(attachment => attachment && attachment.url)
                        .map(attachment => attachment.url);
                } else {
                    imageList = [imageUrl];
                }
            } else {
                return;
            }
            
            // 所有图片都使用预览模态框
            this.currentImageList = imageList;
            this.currentImageIndex = imageIndex;
            this.showImagePreview = true;
            // 获取当前图片尺寸
            this.$nextTick(() => {
                this.getCurrentImageSize();
            });
        },
        
        // 原来的单张图片打开方法
        openImage(imageUrl) {
            if (!imageUrl) return;
            
            try {
                // 显示图片信息
                this.showImageInfo(imageUrl);
                
                // 使用新的图片面板功能
                if (window.showImagePanel) {
                    window.showImagePanel(imageUrl);
                } else {
                    // 备用方案：在浏览器中打开
                    openExternalUrl(imageUrl);
                }
            } catch (error) {
                console.error('打开图片失败:', error);
                // 备用方案：在浏览器中打开
                openExternalUrl(imageUrl);
            }
        },
        
        // 显示图片信息
        showImageInfo(imageUrl) {
            const img = new Image();
            img.onload = () => {
                const info = `图片信息:\n尺寸: ${img.width} × ${img.height}\nURL: ${imageUrl}`;
                console.log(info);
                
                // 如果有通知功能，显示图片信息
                if (window.showNotification) {
                    window.showNotification(info, 'info', 5000);
                }
            };
            img.onerror = () => {
                console.log(`图片URL: ${imageUrl}`);
            };
            img.src = imageUrl;
        },
        
        // 关闭图片预览
        closeImagePreview() {
            this.showImagePreview = false;
            this.currentImageList = [];
            this.currentImageIndex = 0;
        },
        
        // 上一张图片
        prevImage() {
            if (this.currentImageIndex > 0) {
                this.currentImageIndex--;
                this.showImageInfo(this.currentImageUrl);
                this.getCurrentImageSize();
            }
        },
        
        // 下一张图片
        nextImage() {
            if (this.currentImageIndex < this.currentImageList.length - 1) {
                this.currentImageIndex++;
                this.showImageInfo(this.currentImageUrl);
                this.getCurrentImageSize();
            }
        },
        
        // 在浏览器中打开当前图片
        openCurrentImageInBrowser() {
            if (this.currentImageUrl) {
                openExternalUrl(this.currentImageUrl);
            }
        },
        
        // 获取当前图片尺寸
        getCurrentImageSize() {
            if (!this.currentImageUrl) {
                this.currentImageSize = null;
                return;
            }
            
            const img = new Image();
            img.onload = () => {
                this.currentImageSize = `${img.width} × ${img.height}`;
            };
            img.onerror = () => {
                this.currentImageSize = '尺寸获取失败';
            };
            img.src = this.currentImageUrl;
        },
        
        // 处理预览图片加载错误
        handlePreviewImageError(event) {
            console.warn('预览图片加载失败:', event.target.src);
        },

        // 处理预览图片加载成功
        handlePreviewImageLoad(event) {
            console.log('预览图片加载成功:', event.target.src);
            this.getCurrentImageSize();
        },

        // 处理键盘事件
        handleKeydown(event) {
            if (this.showImagePreview) {
                if (event.key === 'ArrowLeft') {
                    this.prevImage();
                } else if (event.key === 'ArrowRight') {
                    this.nextImage();
                }
            }
        },

        // 设置WebSocket控制台功能
        setupWebSocketConsole() {
            if (window.WebSocket) {
                console.log('WebSocket 客户端已准备就绪。');
                
                // 创建全局WebSocket控制台对象
                window.wsConsole = {
                    // 发送消息
                    send: (message) => {
                        if (this.$refs.websocketClient && this.$refs.websocketClient.isConnected) {
                            this.$refs.websocketClient.sendMessage(message);
                        } else {
                            console.warn('WebSocket未连接，无法发送消息');
                        }
                    },
                    
                    // 获取连接状态
                    status: () => {
                        if (this.$refs.websocketClient) {
                            const status = this.$refs.websocketClient.isConnected ? '已连接' : '未连接';
                            console.log(`WebSocket状态: ${status}`);
                            return status;
                        } else {
                            console.warn('WebSocket客户端未找到');
                            return '未找到';
                        }
                    },
                    
                    // 缓存管理
                    clearCache: () => {
                        clearProductCache();
                        this.isDataPreloaded = false;
                        console.log('产品数据缓存已清空');
                        this.showStatusNotification('缓存已清空，下次搜索将重新获取数据', 'info', 3000);
                    },
                    
                    // 预加载数据
                    preloadData: () => {
                        this.preloadData();
                    },
                    
                    // 帮助信息
                    help: () => {
                        console.log('WebSocket控制台命令:');
                        console.log('  wsConsole.send("消息") - 发送自定义消息');
                        console.log('  wsConsole.status() - 查看连接状态');
                        console.log('  wsConsole.clearCache() - 清空产品数据缓存');
                        console.log('  wsConsole.preloadData() - 预加载产品数据');
                        console.log('  wsConsole.help() - 显示此帮助信息');
                        console.log('  注意：所有通知信息将显示在状态栏中');
                    }
                };
                
                console.log('使用 wsConsole.help() 查看所有可用命令');
                
            } else {
                console.warn('您的浏览器不支持 WebSocket。');
            }
        },
        
        // 设置通知系统
        setupNotificationSystem() {
            // 创建全局通知函数
            window.showNotification = (message, type = 'info', duration = 3000) => {
                // 创建通知元素
                const notification = document.createElement('div');
                notification.className = `notification notification-${type}`;
                notification.innerHTML = `
                    <div class="notification-content">
                        <span class="notification-message">${message}</span>
                        <button class="notification-close">&times;</button>
                    </div>
                `;
                
                // 添加到页面
                document.body.appendChild(notification);
                
                // 显示动画
                setTimeout(() => {
                    notification.classList.add('show');
                }, 100);
                
                // 关闭按钮事件
                const closeBtn = notification.querySelector('.notification-close');
                closeBtn.addEventListener('click', () => {
                    this.hideNotification(notification);
                });
                
                // 自动隐藏
                if (duration > 0) {
                    setTimeout(() => {
                        this.hideNotification(notification);
                    }, duration);
                }
            };
            
            console.log('通知系统已准备就绪');
        },
        
        // 隐藏通知
        hideNotification(notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        },

        // 监听WebSocket状态变化
        handleWebSocketStatusChange(status) {
            this.websocketStatus = status;
        },

        // 处理从WebSocket接收到的订单消息
        handleOrderMessageReceived(orderData) {
            console.log('收到订单数据:', orderData);
            
            // 直接使用已经解析好的订单数据
            if (orderData && orderData.product_no) {
                // 自动填充搜索框
                this.inputText = orderData.product_no;
                
                // 直接设置搜索结果，无需重新搜索
                this.searchResult = [orderData];
                this.errorMessage = '';
                this.isLoading = false;
                
                // 在状态栏显示订单信息
                this.orderInfoText = `收到订单信息: ${orderData.product_no}`;
                
                // 显示成功通知
                this.showStatusNotification('收到新的订单数据', 'success', 3000);
                
                console.log('订单信息已更新到界面:', orderData);
            } else {
                console.warn('收到的订单数据格式不正确:', orderData);
                this.showStatusNotification('收到的订单数据格式不正确', 'error', 3000);
            }
        }
    }
};
</script>

<style>
/* 样式已移至 main.css 文件中统一管理 */

/* 状态栏布局样式 */
.status-bar {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: #f5f5f5;
    border-top: 1px solid #e0e0e0;
    gap: 12px;
}

.status-dot-container {
    flex-shrink: 0; /* 防止圆点被压缩 */
    width: 20px; /* 固定宽度 */
}

.status-info-container {
    flex: 1; /* 占据剩余空间 */
    min-width: 0; /* 允许文本截断 */
}

.order-info {
    font-size: 12px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
