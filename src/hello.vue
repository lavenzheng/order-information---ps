<template>
    <form style="padding: 1px; height: 100vh; display: flex; flex-direction: column;">
        <!-- 搜索区域 -->
        <div style="display: flex; align-items: center; margin-top: 20px; gap: 10px; flex-shrink: 0;">
            <sp-textfield 
                :value="inputText"
                @input="handleInput"
                placeholder="请输入产品编号..."
                label="产品编号搜索"
                style="flex: 1;">
            </sp-textfield>
            <sp-button v-on:click="searchProduct" style="margin-left: 10px;">搜索</sp-button>
            <sp-button v-on:click="clearInput" style="margin-left: 5px;">清空</sp-button>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="isLoading" style="margin-top: 20px; text-align: center; flex-shrink: 0;">
            <sp-body>正在搜索中...</sp-body>
        </div>
        
        <!-- 错误状态 -->
        <div v-if="errorMessage" style="margin-top: 20px; color: #d32f2f; flex-shrink: 0;">
            <sp-body>{{ errorMessage }}</sp-body>
        </div>
        
        <!-- 搜索结果显示 -->
        <div v-if="searchResult" style="margin-top: 5px; position: absolute; top: 60px; left: 8px; right: 8px; bottom: 8px;">
            <div v-if="searchResult.length === 0" style="margin-top: 10px; color: #666;">
                未找到匹配的产品编号
            </div>
            <div v-else style="border: 1px solid #ddd; border-radius: 5px; padding: 8px; background-color: #f9f9f9; height: 100%; overflow-y: auto;">
                <div v-for="product in searchResult" :key="product.product_id" 
                     style="margin-bottom: 5px; padding: 10px; border: 1px solid #eee; border-radius: 5px; background-color: white;">
                    
                    <!-- 产品信息 -->
                    <div style="margin-bottom: 20px;">
                        <div @click="toggleProductInfo" class="collapsible-header">
                            <div class="collapsible-title">产品信息</div>
                            <span class="collapsible-arrow">{{ productInfoExpanded ? '▼' : '▶' }}</span>
                        </div>
                        <div v-if="productInfoExpanded" class="collapsible-content">
                            <div class="info-row"><div class="info-label">产品编号:</div><div class="info-value product-no">{{ product.product_no }}</div></div>
                            <div class="info-row"><div class="info-label">产品名称:</div><div class="info-value">{{ product.product_name }}</div></div>
                            <div class="info-row"><div class="info-label">产品状态:</div><div class="info-value product-status">{{ product.product_status_name }}</div></div>
                            <div class="info-row"><div class="info-label">产品进度:</div><div class="info-value product-progress">{{ product.child_status_name }}</div></div>
                            <div class="info-row"><div class="info-label">产品类型:</div><div class="info-value">{{ product.product_type_name }}</div></div>
                            <div v-if="product.customize_info" class="info-row"><div class="info-label">定制信息:</div><div class="info-value"><div v-for="(line, index) in product.customize_info.split('\n')" :key="index" class="customize-info-line"><span v-if="line.includes(':')" class="customize-info-key">{{ line.split(':')[0] }}:</span><span v-if="line.includes(':')" class="customize-info-value">{{ line.split(':')[1] }}</span><span v-else>{{ line }}</span></div></div></div>
                            <div class="info-row"><div class="info-label">设计师:</div><div class="info-value">{{ product.editor_name }}</div></div>
                            <div class="info-row"><div class="info-label">创建时间:</div><div class="info-value">{{ formatDate(product.create_time) }}</div></div>
                            <div v-if="product.more_detail && product.more_detail.url" class="info-row"><div class="info-label">更多详情:</div><div class="info-value"><a :href="product.more_detail.url" target="_blank" class="more-detail-link">{{ product.more_detail.url }}</a></div></div>
                            <div v-if="product.attachments && product.attachments.length > 0 && product.attachments[0].url" class="info-row"><div class="info-label">参考附件:</div><div class="info-value"><img :src="product.attachments[0].url" alt="参考附件" class="reference-image" @click="openImage(product.attachments[0].url)" /></div></div>
                        </div>
                    </div>
                    
                    <!-- 支付信息 -->
                    <div style="margin-bottom: 20px;">
                        <div @click="togglePaymentInfo" class="collapsible-header">
                            <div class="collapsible-title">支付信息</div>
                            <span class="collapsible-arrow">{{ paymentInfoExpanded ? '▼' : '▶' }}</span>
                        </div>
                        <div v-if="paymentInfoExpanded" class="collapsible-content">
                            <div class="info-row"><div class="info-label">总价:</div><div class="info-value total-price">${{ formatCurrency(product.total_price) }}</div></div>
                            <div class="info-row"><div class="info-label">已付金额:</div><div class="info-value paid-amount">${{ formatCurrency(product.total_pay) }}</div></div>
                            <div class="info-row"><div class="info-label">首付:</div><div class="info-value">${{ formatCurrency(product.first_pay) }}</div></div>
                            <div class="info-row"><div class="info-label">二次付款:</div><div class="info-value">${{ formatCurrency(product.second_pay) }}</div></div>
                            <div class="info-row"><div class="info-label">三次付款:</div><div class="info-value">${{ formatCurrency(product.third_pay) }}</div></div>
                            <div class="info-row"><div class="info-label">尾款:</div><div class="info-value">${{ formatCurrency(product.last_pay) }}</div></div>
                            <div class="info-row"><div class="info-label">支付状态:</div><div class="info-value">{{ product.pay_status_name }}</div></div>
                        </div>
                    </div>
                    
                    <!-- 客户信息 -->
                    <div v-if="product.customer" style="margin-bottom: 20px;">
                        <div @click="toggleCustomerInfo" class="collapsible-header">
                            <div class="collapsible-title">客户信息</div>
                            <span class="collapsible-arrow">{{ customerInfoExpanded ? '▼' : '▶' }}</span>
                        </div>
                        <div v-if="customerInfoExpanded" class="collapsible-content">
                            <div class="info-row"><div class="info-label">客户姓名:</div><div class="info-value">{{ product.customer.name }}</div></div>
                            <div class="info-row"><div class="info-label">客户编号:</div><div class="info-value customer-no">{{ product.customer.customer_no }}</div></div>
                            <div class="info-row"><div class="info-label">邮箱:</div><div class="info-value">{{ product.customer.email }}</div></div>
                            <div class="info-row"><div class="info-label">电话:</div><div class="info-value">{{ product.customer.phone }}</div></div>
                            <div class="info-row"><div class="info-label">账单地址:</div><div class="info-value address-text">{{ product.customer.billing_address }}</div></div>
                            <div class="info-row"><div class="info-label">收货地址:</div><div class="info-value address-text">{{ product.customer.shipping_address }}</div></div>
                            <div v-if="product.customer.memo" class="info-row"><div class="info-label">备注:</div><div class="info-value address-text">{{ product.customer.memo }}</div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
</template>

<script>
module.exports = {
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
                const response = await fetch('https://ordertrack.365d4u.com/api/product/list?page=1&page_size=100&attribute=0&upload=0');
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data && data.data && data.data.products) {
                    const matchedProduct = data.data.products.find(product => 
                        product.product_no && 
                        product.product_no.toLowerCase() === this.inputText.toLowerCase()
                    );
                    
                    this.searchResult = matchedProduct ? [matchedProduct] : [];
                    
                    if (this.searchResult.length === 0) {
                        this.errorMessage = '未找到匹配的产品编号';
                    }
                } else {
                    this.errorMessage = 'API返回数据格式错误';
                }
            } catch (error) {
                console.error('搜索失败:', error);
                this.errorMessage = error.message || '搜索失败，请重试';
            } finally {
                this.isLoading = false;
            }
        },
        
        formatDate(dateString) {
            if (!dateString) return '未提供';
            try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) {
                    return '日期格式错误';
                }
                return date.toLocaleString('zh-CN');
            } catch (error) {
                return '日期格式错误';
            }
        },
        
        formatCurrency(amount) {
            if (amount === null || amount === undefined || amount === '') {
                return '0.00';
            }
            try {
                const num = parseFloat(amount);
                if (isNaN(num)) {
                    return '0.00';
                }
                return num.toFixed(2);
            } catch (error) {
                return '0.00';
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
            console.log('=== openImage 调试信息 ===');
            console.log('openImage 被调用，URL:', imageUrl);
            console.log('window.showImagePanel 类型:', typeof window.showImagePanel);
            console.log('window.showImagePanel 值:', window.showImagePanel);
            
            if (imageUrl) {
                try {
                    // 使用新的图片面板功能
                    if (window.showImagePanel) {
                        console.log('调用 showImagePanel...');
                        window.showImagePanel(imageUrl);
                        console.log('图片面板打开成功');
                    } else {
                        console.log('showImagePanel 函数不可用，使用备用方案');
                        this.openInBrowser(imageUrl);
                    }
                } catch (error) {
                    console.error('打开图片面板失败:', error);
                    console.error('错误详情:', error.stack);
                    // 备用方案：在浏览器中打开
                    this.openInBrowser(imageUrl);
                }
            }
        },
        
        openInBrowser(imageUrl) {
            try {
                const uxp = require('uxp');
                if (uxp && uxp.shell && uxp.shell.openExternal) {
                    uxp.shell.openExternal(imageUrl);
                    console.log('在默认浏览器中打开图片');
                } else {
                    console.log('uxp.shell.openExternal 不可用');
                }
            } catch (error) {
                console.error('在浏览器中打开图片失败:', error);
            }
        }
    },
            data() {
            return {
                inputText: '',
                searchResult: null,
                isLoading: false,
                errorMessage: '',
                productInfoExpanded: true,    // 默认展开产品信息
                customerInfoExpanded: false,   // 默认展开客户信息
                paymentInfoExpanded: false     // 默认展开支付信息
            };
        }
};
</script>

<style>
/* 样式已移至 main.css 文件中统一管理 */
</style>
