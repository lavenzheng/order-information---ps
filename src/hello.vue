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
                        @openImage="openImage" />
                    
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
            paymentInfoExpanded: config.ui.defaultExpanded.paymentInfo
        };
    },
    methods: {
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
        
        openImage(imageUrl) {
            if (!imageUrl) return;
            
            try {
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
        }
    }
};
</script>

<style>
/* 样式已移至 main.css 文件中统一管理 */
</style>
