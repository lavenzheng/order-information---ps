<template>
    <div class="plugin-container">
        <!-- WebSocket连接区域 -->
        <WebSocketClient 
            :expanded="websocketExpanded"
            @toggle="toggleWebsocket"
            @orderDataReceived="handleOrderDataReceived"
        />
        
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
    </div>
</template>

<script>
import ProductInfo from './components/ProductInfo.vue';
import PaymentInfo from './components/PaymentInfo.vue';
import CustomerInfo from './components/CustomerInfo.vue';
import WebSocketClient from './components/WebSocketClient.vue';
import { searchProductByNo } from './api/productApi';
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
            websocketExpanded: true
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
    mounted() {
        // 添加键盘事件监听
        document.addEventListener('keydown', this.handleKeydown);
    },
    beforeDestroy() {
        // 移除键盘事件监听
        document.removeEventListener('keydown', this.handleKeydown);
    },
    methods: {
        // 新增：切换WebSocket区域展开状态
        toggleWebsocket() {
            this.websocketExpanded = !this.websocketExpanded;
        },
        
        // 新增：处理从WebSocket接收到的订单数据
        handleOrderDataReceived(orderData) {
            console.log('收到订单数据:', orderData);
            
            // 这里可以根据需要处理订单数据
            // 例如：自动填充搜索框、显示通知等
            
            // 如果订单数据包含产品编号，可以自动搜索
            if (orderData.product_no) {
                this.inputText = orderData.product_no;
                this.searchProduct();
            }
            
            // 显示成功通知
            if (window.showNotification) {
                window.showNotification('收到新的订单数据', 'success', 3000);
            }
        },
        
        handleInput(event) {
            this.inputText = event.target.value;
        },
        
        clearInput() {
            this.inputText = '';
            this.searchResult = null;
            this.errorMessage = '';
        },
        
        async searchProduct() {
            if (!this.inputText.trim()) {
                this.errorMessage = '请输入产品编号';
                return;
            }
            
            this.isLoading = true;
            this.errorMessage = '';
            this.searchResult = null;
            
            try {
                const result = await searchProductByNo(this.inputText.trim());
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
        
        // 新的图片预览方法
        openImageWithIndex(imageData) {
            if (!imageData) return;
            
            // 处理不同的参数格式
            let imageUrl, imageList, imageIndex;
            
            if (typeof imageData === 'string') {
                // 兼容原来的字符串格式 - 使用原来的单张图片打开方式
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
                // 显示图片信息（尺寸、URL等）
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
                // 显示当前图片信息
                this.showImageInfo(this.currentImageUrl);
                // 获取当前图片尺寸
                this.getCurrentImageSize();
            }
        },
        
        // 下一张图片
        nextImage() {
            if (this.currentImageIndex < this.currentImageList.length - 1) {
                this.currentImageIndex++;
                // 显示当前图片信息
                this.showImageInfo(this.currentImageUrl);
                // 获取当前图片尺寸
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
            
            console.log('开始获取图片尺寸:', this.currentImageUrl);
            
            // 参考之前单张图片的尺寸获取逻辑
            const img = new Image();
            img.onload = () => {
                console.log('图片尺寸获取成功:', img.width, '×', img.height);
                this.currentImageSize = `${img.width} × ${img.height}`;
                console.log('设置currentImageSize:', this.currentImageSize);
            };
            img.onerror = () => {
                console.warn('图片尺寸获取失败:', this.currentImageUrl);
                this.currentImageSize = '尺寸获取失败';
            };
            img.src = this.currentImageUrl;
        },
        
        // 处理预览图片加载错误
        handlePreviewImageError(event) {
            console.warn('预览图片加载失败:', event.target.src);
            // 可以在这里显示一个占位图片
        },

        // 处理预览图片加载成功
        handlePreviewImageLoad(event) {
            console.log('预览图片加载成功:', event.target.src);
            // 图片加载成功后，获取尺寸
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
        }
    }
};
</script>

<style>
/* 样式已移至 main.css 文件中统一管理 */
</style>
