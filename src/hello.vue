<template>
    <div class="plugin-container">
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
import { searchProductByNo } from './api/productApi';
import { openExternalUrl } from './utils/uxpUtils';
import config from './config';

export default {
    name: 'ProductSearch',
    components: {
        ProductInfo,
        PaymentInfo,
        CustomerInfo
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
            // 自动搜索相关
            lastSearchedKeyword: '',
            urlCheckInterval: null
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
        
        // 初始检查参数
        this.autoSearchFromParams();
        
        // 设置持续监听参数变化
        this.startParameterListener();
    },
    
    beforeDestroy() {
        // 移除键盘事件监听
        document.removeEventListener('keydown', this.handleKeydown);
        
        // 清理参数监听器
        this.stopParameterListener();
    },
    
    methods: {
        // 启动参数监听器
        startParameterListener() {
            // 方法1: 定期检查URL变化
            this.urlCheckInterval = setInterval(() => {
                this.checkForNewParameters();
            }, 1000); // 每秒检查一次
            
            // 方法2: 监听hashchange事件
            window.addEventListener('hashchange', this.handleHashChange);
            
            // 方法3: 监听popstate事件
            window.addEventListener('popstate', this.handlePopState);
            
            // 方法4: 监听storage事件（跨标签页通信）
            window.addEventListener('storage', this.handleStorageChange);
            
            console.log('参数监听器已启动');
        },
        
        // 停止参数监听器
        stopParameterListener() {
            if (this.urlCheckInterval) {
                clearInterval(this.urlCheckInterval);
                this.urlCheckInterval = null;
            }
            
            window.removeEventListener('hashchange', this.handleHashChange);
            window.removeEventListener('popstate', this.handlePopState);
            window.removeEventListener('storage', this.handleStorageChange);
            
            console.log('参数监听器已停止');
        },
        
        // 处理hash变化
        handleHashChange() {
            console.log('检测到hash变化');
            this.checkForNewParameters();
        },
        
        // 处理popstate事件
        handlePopState() {
            console.log('检测到popstate事件');
            this.checkForNewParameters();
        },
        
        // 处理storage变化
        handleStorageChange(event) {
            if (event.key === 'pluginSearchParam') {
                console.log('检测到storage变化:', event.newValue);
                this.handleNewParameter(event.newValue);
            }
        },
        
        // 检查新参数
        checkForNewParameters() {
            try {
                // 检查URL参数
                const urlParams = new URLSearchParams(window.location.search);
                const searchParam = urlParams.get('search') || urlParams.get('q') || urlParams.get('product');
                
                // 检查hash参数
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const hashSearchParam = hashParams.get('search') || hashParams.get('q') || hashParams.get('product');
                
                // 检查localStorage中的新参数
                const newSearchParam = localStorage.getItem('pluginSearchParam');
                const newSearchTimestamp = localStorage.getItem('pluginSearchTimestamp');
                
                // 获取当前时间戳
                const currentTimestamp = Date.now();
                
                // 优先级: URL参数 > Hash参数 > localStorage新参数
                let searchKeyword = searchParam || hashSearchParam || newSearchParam;
                
                if (searchKeyword && searchKeyword.trim()) {
                    // 检查localStorage中的时间戳
                    if (newSearchTimestamp) {
                        const timestampDiff = currentTimestamp - parseInt(newSearchTimestamp);
                        // 如果时间戳是新的（5秒内），强制使用新参数
                        if (timestampDiff < 5000) {
                            console.log('检测到时间戳新参数:', searchKeyword, '时间差:', timestampDiff + 'ms');
                            this.handleNewParameter(searchKeyword);
                            return;
                        }
                    }
                    
                    // 检查是否是新参数
                    if (searchKeyword !== this.lastSearchedKeyword) {
                        console.log('检测到新参数:', searchKeyword);
                        this.handleNewParameter(searchKeyword);
                    } else {
                        // 如果是相同参数，但localStorage中有新参数，也处理
                        if (newSearchParam && newSearchParam.trim() && newSearchParam !== this.lastSearchedKeyword) {
                            console.log('检测到localStorage中的新参数:', newSearchParam);
                            this.handleNewParameter(newSearchParam);
                        }
                    }
                }
                
                // 检查是否有强制更新标记
                const forceUpdate = localStorage.getItem('pluginForceUpdate');
                if (forceUpdate === 'true') {
                    console.log('检测到强制更新标记');
                    localStorage.removeItem('pluginForceUpdate');
                    // 强制清除上次搜索记录
                    this.clearLastSearch();
                    if (searchKeyword && searchKeyword.trim()) {
                        console.log('强制更新参数:', searchKeyword);
                        this.handleNewParameter(searchKeyword);
                    }
                }
                
                // 检查是否有强制清除标记
                const forceClear = localStorage.getItem('pluginForceClear');
                if (forceClear === 'true') {
                    console.log('检测到强制清除标记');
                    localStorage.removeItem('pluginForceClear');
                    this.clearLastSearch();
                    // 重新检查参数
                    setTimeout(() => {
                        this.checkForNewParameters();
                    }, 100);
                }
            } catch (error) {
                console.error('检查新参数失败:', error);
            }
        },
        
        // 处理新参数
        handleNewParameter(searchKeyword) {
            if (!searchKeyword || !searchKeyword.trim()) return;
            
            console.log('处理新参数:', searchKeyword);
            this.lastSearchedKeyword = searchKeyword;
            this.inputText = searchKeyword.trim();
            
            // 保存到localStorage
            this.saveSearchKeyword(searchKeyword);
            
            // 清除临时参数
            localStorage.removeItem('pluginSearchParam');
            localStorage.removeItem('pluginSearchTimestamp');
            
            // 延迟搜索
            this.$nextTick(() => {
                setTimeout(() => {
                    this.searchProduct();
                }, 500);
            });
        },
        
        handleInput(event) {
            this.inputText = event.target.value;
        },
        
        clearInput() {
            this.inputText = '';
            this.searchResult = null;
            this.errorMessage = '';
        },
        
        // 搜索产品
        async searchProduct() {
            if (!this.inputText.trim()) {
                this.errorMessage = '请输入产品编号';
                return;
            }
            
            // 保存搜索关键词
            this.saveSearchKeyword(this.inputText);
            
            this.isLoading = true;
            this.errorMessage = '';
            this.searchResult = null;
            
            try {
                const result = await searchProductByNo(this.inputText.trim());
                
                if (result && result.length > 0) {
                    this.searchResult = result;
                    console.log('搜索成功:', result);
                } else {
                    this.errorMessage = '未找到匹配的产品';
                    console.log('未找到产品');
                }
            } catch (error) {
                console.error('搜索失败:', error);
                this.errorMessage = '搜索失败，请重试';
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
        },

        // 自动从参数中获取搜索关键词并搜索（初始检查）
        autoSearchFromParams() {
            try {
                // 方法1: 从URL参数获取
                const urlParams = new URLSearchParams(window.location.search);
                const searchParam = urlParams.get('search') || urlParams.get('q') || urlParams.get('product');
                
                // 方法2: 从hash参数获取
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const hashSearchParam = hashParams.get('search') || hashParams.get('q') || hashParams.get('product');
                
                // 方法3: 从localStorage获取（如果之前保存过）
                const savedSearch = localStorage.getItem('autoSearchProduct');
                
                // 优先级: URL参数 > Hash参数 > localStorage
                const searchKeyword = searchParam || hashSearchParam || savedSearch;
                
                if (searchKeyword && searchKeyword.trim()) {
                    console.log('初始检查到搜索关键词:', searchKeyword);
                    this.lastSearchedKeyword = searchKeyword;
                    this.inputText = searchKeyword.trim();
                    
                    // 延迟一点时间确保组件完全加载后再搜索
                    this.$nextTick(() => {
                        setTimeout(() => {
                            this.searchProduct();
                        }, 500);
                    });
                }
            } catch (error) {
                console.error('初始参数检查失败:', error);
            }
        },
        
        // 保存搜索关键词到localStorage（供下次自动搜索使用）
        saveSearchKeyword(keyword) {
            if (keyword && keyword.trim()) {
                localStorage.setItem('autoSearchProduct', keyword.trim());
                // 同时保存时间戳
                localStorage.setItem('pluginSearchTimestamp', Date.now().toString());
            }
        },
        
        // 清除上次搜索记录（强制接收新参数）
        clearLastSearch() {
            this.lastSearchedKeyword = '';
            localStorage.removeItem('autoSearchProduct');
            localStorage.removeItem('pluginSearchTimestamp');
            console.log('已清除上次搜索记录');
        }
    }
};
</script>

<style>
/* 样式已移至 main.css 文件中统一管理 */
</style>
