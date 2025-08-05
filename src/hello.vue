<template>
    <form style="padding: 1px;">
        <sp-heading>
            订单查询系统
        </sp-heading>
        
        <!-- 搜索区域 - 一行布局 -->
        <div style="display: flex; align-items: center; margin-top: 20px; gap: 10px;">
            <sp-textfield 
                :value="inputText"
                @input="handleInput"
                placeholder="请输入产品编号..."
                label="产品编号搜索"
                style="flex: 1;">
            </sp-textfield>
            
            <sp-button 
                v-on:click="searchProduct" 
                style="margin-left: 10px;">
                搜索
            </sp-button>
            
            <sp-button 
                v-on:click="clearInput" 
                style="margin-left: 5px;">
                清空
            </sp-button>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="isLoading" style="margin-top: 20px; text-align: center;">
            <sp-body>正在搜索中...</sp-body>
        </div>
        
        <!-- 错误信息 -->
        <div v-if="errorMessage" style="margin-top: 20px; color: #d32f2f;">
            <sp-body>{{ errorMessage }}</sp-body>
        </div>
        
        <!-- 搜索结果展示 - 原始数据 -->
        <div v-if="searchResult" style="margin-top: 20px;">
            <sp-heading>搜索结果</sp-heading>
            <div v-if="searchResult.length === 0" style="margin-top: 10px; color: #666;">
                未找到匹配的产品编号
            </div>
            <div v-else style="max-height: 400px; overflow-y: scroll; border: 1px solid #ddd; border-radius: 5px; padding: 15px; background-color: #f9f9f9;">
                <div v-for="product in searchResult" :key="product.product_id" 
                     style="margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 5px; background-color: white;">
                    
                    <!-- 解析后的数据展示 -->
                    <div style="background-color: white; padding: 15px; border-radius: 5px;">
                        
                        <!-- 调试信息 -->
                        <div style="margin-bottom: 15px; padding: 10px; background-color: #f0f0f0; border-radius: 3px; font-size: 12px;">
                            <strong>调试信息:</strong><br>
                            产品ID: {{ product.product_id }}<br>
                            产品编号: {{ product.product_no }}<br>
                            产品名称: {{ product.product_name }}<br>
                            产品状态: {{ product.product_status_name }}<br>
                            总价格: {{ product.total_price }}<br>
                            已支付: {{ product.total_pay }}<br>
                            客户对象: {{ typeof product.customer }}<br>
                            定制信息: {{ typeof product.customize_info }}
                        </div>
                        
                        <!-- 产品信息 -->
                        <div style="margin-bottom: 20px;">
                            <sp-heading size="S" style="color: #2e7d32; margin-bottom: 10px;">产品信息</sp-heading>
                            <div>
                                <div style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">产品编号:</div>
                                    <div style="flex: 1; color: #1976d2; font-weight: bold;">{{ product.product_no }}</div>
                                </div>
                                
                                <div style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">产品名称:</div>
                                    <div style="flex: 1;">{{ product.product_name }}</div>
                                </div>
                                
                                <div style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">产品状态:</div>
                                    <div style="flex: 1; color: #d32f2f;">{{ product.product_status_name }}</div>
                                </div>
                                
                                <div style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">产品类型:</div>
                                    <div style="flex: 1;">{{ product.product_type_name }}</div>
                                </div>
                                
                                <div v-if="product.customize_info" style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">定制信息:</div>
                                    <div style="flex: 1; word-break: break-all;">{{ product.customize_info }}</div>
                                </div>
                                
                                <div style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">设计师:</div>
                                    <div style="flex: 1;">{{ product.editor_name }}</div>
                                </div>
                                
                                <div style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">创建时间:</div>
                                    <div style="flex: 1;">{{ formatDate(product.create_time) }}</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 支付信息 -->
                        <div style="margin-bottom: 20px;">
                            <sp-heading size="S" style="color: #2e7d32; margin-bottom: 10px;">支付信息</sp-heading>
                            <div>
                                <div style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">总价:</div>
                                    <div style="flex: 1; color: #d32f2f; font-weight: bold; font-size: 16px;">${{ formatCurrency(product.total_price) }}</div>
                                </div>
                                
                                <div style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">已付金额:</div>
                                    <div style="flex: 1; color: #2e7d32; font-weight: bold; font-size: 16px;">${{ formatCurrency(product.total_pay) }}</div>
                                </div>
                                
                                <div style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">首付:</div>
                                    <div style="flex: 1;">${{ formatCurrency(product.first_pay) }}</div>
                                </div>
                                
                                <div style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">二次付款:</div>
                                    <div style="flex: 1;">${{ formatCurrency(product.second_pay) }}</div>
                                </div>
                                
                                <div style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">三次付款:</div>
                                    <div style="flex: 1;">${{ formatCurrency(product.third_pay) }}</div>
                                </div>
                                
                                <div style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">尾款:</div>
                                    <div style="flex: 1;">${{ formatCurrency(product.last_pay) }}</div>
                                </div>
                                
                                <div style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">支付状态:</div>
                                    <div style="flex: 1;">{{ product.pay_status_name }}</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 客户信息 -->
                        <div v-if="product.customer" style="margin-bottom: 20px;">
                            <sp-heading size="S" style="color: #2e7d32; margin-bottom: 10px;">客户信息</sp-heading>
                            <div>
                                <div style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">客户姓名:</div>
                                    <div style="flex: 1;">{{ product.customer.name }}</div>
                                </div>
                                
                                <div style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">客户编号:</div>
                                    <div style="flex: 1; color: #1976d2;">{{ product.customer.customer_no }}</div>
                                </div>
                                
                                <div style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">邮箱:</div>
                                    <div style="flex: 1;">{{ product.customer.email }}</div>
                                </div>
                                
                                <div style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">电话:</div>
                                    <div style="flex: 1;">{{ product.customer.phone }}</div>
                                </div>
                                
                                <div style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">账单地址:</div>
                                    <div style="flex: 1; word-break: break-all;">{{ product.customer.billing_address }}</div>
                                </div>
                                
                                <div style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">收货地址:</div>
                                    <div style="flex: 1; word-break: break-all;">{{ product.customer.shipping_address }}</div>
                                </div>
                                
                                <div v-if="product.customer.memo" style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">备注:</div>
                                    <div style="flex: 1; word-break: break-all;">{{ product.customer.memo }}</div>
                                </div>
                            </div>
                        </div>
                        

                        
                        <!-- 原始数据链接 -->
                        <div style="margin-top: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 3px; font-size: 12px;">
                            <details>
                                <summary style="cursor: pointer; color: #666;">查看原始JSON数据</summary>
                                <pre style="margin-top: 10px; font-family: monospace; font-size: 11px; white-space: pre-wrap; color: #333;">{{ JSON.stringify(product, null, 2) }}</pre>
                            </details>
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
                // 直接获取输入框的值
                const value = event.target.value;
                console.log('输入事件触发，值:', value);
                this.inputText = value;
                // 清空之前的搜索结果
                this.searchResult = null;
                this.errorMessage = '';
            },
            clearInput() {
                this.inputText = '';
                this.searchResult = null;
                this.errorMessage = '';
            },
            async searchProduct() {
                console.log('searchProduct 方法被调用');
                console.log('this.inputText 原始值:', this.inputText);
                console.log('this.inputText 类型:', typeof this.inputText);
                
                const searchText = this.inputText.trim();
                console.log('搜索产品编号:', searchText);
                console.log('searchText 长度:', searchText.length);
                
                if (!searchText) {
                    console.log('输入为空，显示错误信息');
                    this.errorMessage = '请输入产品编号';
                    return;
                }
                
                this.isLoading = true;
                this.errorMessage = '';
                this.searchResult = null;
                
                try {
                    console.log('开始调用API...');
                    const response = await fetch('https://ordertrack.365d4u.com/api/product/list?page=1&page_size=10&attribute=0&upload=0');
                    console.log('API响应状态:', response.status);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    console.log('API返回数据:', data);
                    
                    if (data.code === 0 && data.data && data.data.products) {
                        // 搜索完全匹配的产品编号
                        const matchedProducts = data.data.products.filter(product => 
                            product.product_no === searchText
                        );
                        
                        console.log('匹配的产品数量:', matchedProducts.length);
                        this.searchResult = matchedProducts;
                        
                        if (matchedProducts.length === 0) {
                            console.log('未找到匹配的产品编号:', searchText);
                            this.errorMessage = `未找到产品编号: ${searchText}`;
                        } else {
                            console.log('找到匹配的产品:', matchedProducts);
                        }
                    } else {
                        console.error('API返回数据格式错误:', data);
                        this.errorMessage = 'API返回数据格式错误';
                    }
                } catch (error) {
                    console.error('搜索出错:', error);
                    this.errorMessage = `搜索失败: ${error.message}`;
                } finally {
                    this.isLoading = false;
                }
            },
            formatDate(dateString) {
                if (!dateString) return '';
                const date = new Date(dateString);
                return date.toLocaleString('zh-CN');
            },
            formatCurrency(amount) {
                if (amount === null || amount === undefined) return '0.00';
                return parseFloat(amount).toFixed(2);
            },
            formatAddress(address) {
                if (!address) return '未提供';
                if (typeof address === 'string') return address;
                if (Array.isArray(address)) return address.join(', ');
                return '未提供';
            },
            formatJsonData(obj, indent = 0) {
                if (!obj) return '';
                
                const spaces = '  '.repeat(indent);
                let result = '';
                
                for (const [key, value] of Object.entries(obj)) {
                    if (value === null || value === undefined) {
                        result += `${spaces}${key}: null\n`;
                    } else if (typeof value === 'object' && !Array.isArray(value)) {
                        result += `${spaces}${key}:\n`;
                        result += this.formatJsonData(value, indent + 1);
                    } else if (Array.isArray(value)) {
                        result += `${spaces}${key}:\n`;
                        value.forEach((item, index) => {
                            result += `${spaces}  [${index}]: `;
                            if (typeof item === 'object' && item !== null) {
                                result += '\n' + this.formatJsonData(item, indent + 2);
                            } else {
                                result += `${item}\n`;
                            }
                        });
                    } else {
                        result += `${spaces}${key}: ${value}\n`;
                    }
                }
                
                return result;
            },
            hasOtherInfo(product) {
                // 检查是否有其他未分类的信息
                const standardKeys = ['product_id', 'product_no', 'product_name', 'product_status_name', 
                                   'child_status_name', 'product_type', 'designer', 'create_time', 
                                   'total_price', 'total_pay', 'customer', 'customize_info'];
                return Object.keys(product).some(key => !standardKeys.includes(key));
            },
            getOtherInfo(product) {
                // 获取其他未分类的信息
                const standardKeys = ['product_id', 'product_no', 'product_name', 'product_status_name', 
                                   'child_status_name', 'product_type', 'designer', 'create_time', 
                                   'total_price', 'total_pay', 'customer', 'customize_info'];
                const otherInfo = {};
                for (const [key, value] of Object.entries(product)) {
                    if (!standardKeys.includes(key)) {
                        otherInfo[key] = value;
                    }
                }
                return otherInfo;
            },
            formatKey(key) {
                // 格式化键名，将下划线转换为空格并首字母大写
                return key.replace(/_/g, ' ')
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
            },
            formatValue(value) {
                if (value === null || value === undefined) return '未提供';
                if (typeof value === 'object') return JSON.stringify(value);
                return value.toString();
            },
            
            // 检查是否有其他字段
            hasOtherFields(product) {
                const standardFields = ['product_id', 'product_no', 'product_name', 'product_status', 
                                      'product_status_name', 'product_type', 'designer', 'create_time', 
                                      'total_price', 'total_pay', 'customer', 'customize_info'];
                return Object.keys(product).some(key => !standardFields.includes(key));
            },
            
            // 获取其他字段
            getOtherFields(product) {
                const standardFields = ['product_id', 'product_no', 'product_name', 'product_status', 
                                      'product_status_name', 'product_type', 'designer', 'create_time', 
                                      'total_price', 'total_pay', 'customer', 'customize_info'];
                const otherFields = {};
                for (const [key, value] of Object.entries(product)) {
                    if (!standardFields.includes(key)) {
                        otherFields[key] = value;
                    }
                }
                return otherFields;
            },
            
            // 格式化字段名称
            formatFieldName(key) {
                const nameMap = {
                    'product_id': '产品ID',
                    'product_no': '产品编号',
                    'product_name': '产品名称',
                    'product_status': '产品状态',
                    'product_status_name': '产品状态名称',
                    'product_type': '产品类型',
                    'designer': '设计师',
                    'create_time': '创建时间',
                    'total_price': '总价格',
                    'total_pay': '已支付',
                    'customer': '客户信息',
                    'customize_info': '定制信息'
                };
                return nameMap[key] || key.replace(/_/g, ' ').split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
            },
            
            // 格式化字段值
            formatFieldValue(value) {
                if (value === null || value === undefined) return '未提供';
                if (typeof value === 'object' && !Array.isArray(value)) {
                    return JSON.stringify(value, null, 2);
                }
                if (Array.isArray(value)) {
                    return value.join(', ');
                }
                return value.toString();
            }
        },
        data() {
            return {
                reactive: true,
                inputText: '', // 输入文本数据
                searchResult: null, // 搜索结果
                isLoading: false, // 加载状态
                errorMessage: '' // 错误信息
            }
        }
    }
</script>
