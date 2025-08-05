<template>
    <form style="padding: 1px; height: 100vh; display: flex; flex-direction: column;">
        
        <!-- 搜索区域 - 一行布局 -->
        <div style="display: flex; align-items: center; margin-top: 20px; gap: 10px; flex-shrink: 0;">
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
        <div v-if="isLoading" style="margin-top: 20px; text-align: center; flex-shrink: 0;">
            <sp-body>正在搜索中...</sp-body>
        </div>
        
        <!-- 错误信息 -->
        <div v-if="errorMessage" style="margin-top: 20px; color: #d32f2f; flex-shrink: 0;">
            <sp-body>{{ errorMessage }}</sp-body>
        </div>
        
        <!-- 搜索结果展示 - 原始数据 -->
        <div v-if="searchResult" style="margin-top: 5px; position: absolute; top: 60px; left: 8px; right: 8px; bottom: 8px;">
            <div v-if="searchResult.length === 0" style="margin-top: 10px; color: #666;">
                未找到匹配的产品编号
            </div>
            <div v-else style="border: 1px solid #ddd; border-radius: 5px; padding: 8px; background-color: #f9f9f9; height: 100%; overflow-y: auto;">
                <div v-for="product in searchResult" :key="product.product_id" 
                     style="margin-bottom: 5px; padding: 10px; border: 1px solid #eee; border-radius: 5px; background-color: white;">
                    
                    <!-- 解析后的数据展示 -->
                    <div style="background-color: white; padding: 8px; border-radius: 5px; font-size: 14px;">
                        

                        

                        
                        <!-- 产品信息 -->
                        <div style="margin-bottom: 20px;">
                            <div @click="toggleProductInfo" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; cursor: pointer; user-select: none; transition: all 0.3s ease; background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%); border-radius: 8px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: relative; overflow: hidden;">
                                <div style="color: #333333; font-size: 18px; font-weight: 700; margin: 0; pointer-events: none; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-shadow: 0 1px 2px rgba(255,255,255,0.5); position: relative; z-index: 1;">产品信息</div>
                                <span style="font-size: 14px; color: #666666; pointer-events: none; position: relative; z-index: 1; font-weight: bold;">{{ productInfoExpanded ? '▼' : '▶' }}</span>
                            </div>
                            <div v-if="productInfoExpanded" style="padding: 15px 8px;">
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
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">产品进度:</div>
                                    <div style="flex: 1; color: #d32f2f;">{{ product.child_status_name }}</div>
                                </div>
                                
                                <div style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">产品类型:</div>
                                    <div style="flex: 1;">{{ product.product_type_name }}</div>
                                </div>
                                
                                <div v-if="product.customize_info" style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">定制信息:</div>
                                    <div style="flex: 1;">
                                        <div v-for="(line, index) in product.customize_info.split('\n')" :key="index" style="margin-bottom: 2px;">
                                            <span v-if="line.includes(':')" style="font-weight: bold; color: #000000;">{{ line.split(':')[0] }}:</span>
                                            <span v-if="line.includes(':')" style="margin-left: 5px;">{{ line.split(':')[1] }}</span>
                                            <span v-else>{{ line }}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">设计师:</div>
                                    <div style="flex: 1;">{{ product.editor_name }}</div>
                                </div>
                                
                                <div style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">创建时间:</div>
                                    <div style="flex: 1;">{{ formatDate(product.create_time) }}</div>
                                </div>
                                
                                <div v-if="product.more_detail.url" style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">更多详情:</div>
                                    <div style="flex: 1;">
                                        <a :href="product.more_detail.url" target="_blank" style="color: #1976d2; text-decoration: underline;">{{ product.more_detail.url }}</a>
                                    </div>
                                </div>
                                
                                <div v-if="product.attachments && product.attachments.length > 0 && product.attachments[0].url" style="display: flex; margin-bottom: 8px;">
                                    <div style="font-weight: bold; width: 120px; flex-shrink: 0;">参考附件:</div>
                                    <div style="flex: 1;">
                                        <img :src="product.attachments[0].url" alt="参考附件" style="max-width: 200px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;" @click="openImage(product.attachments[0].url)" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 支付信息 -->
                        <div style="margin-bottom: 20px;">
                            <div @click="togglePaymentInfo" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; cursor: pointer; user-select: none; transition: all 0.3s ease; background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%); border-radius: 8px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: relative; overflow: hidden;">
                                <div style="color: #333333; font-size: 18px; font-weight: 700; margin: 0; pointer-events: none; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-shadow: 0 1px 2px rgba(255,255,255,0.5); position: relative; z-index: 1;">支付信息</div>
                                <span style="font-size: 14px; color: #666666; pointer-events: none; position: relative; z-index: 1; font-weight: bold;">{{ paymentInfoExpanded ? '▼' : '▶' }}</span>
                            </div>
                            <div v-if="paymentInfoExpanded" style="padding: 15px 8px;">
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
                            <div @click="toggleCustomerInfo" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; cursor: pointer; user-select: none; transition: all 0.3s ease; background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%); border-radius: 8px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: relative; overflow: hidden;">
                                <div style="color: #333333; font-size: 18px; font-weight: 700; margin: 0; pointer-events: none; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-shadow: 0 1px 2px rgba(255,255,255,0.5); position: relative; z-index: 1;">客户信息</div>
                                <span style="font-size: 14px; color: #666666; pointer-events: none; position: relative; z-index: 1; font-weight: bold;">{{ customerInfoExpanded ? '▼' : '▶' }}</span>
                            </div>
                            <div v-if="customerInfoExpanded" style="padding: 15px 8px;">
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
            toggleProductInfo() {
                this.productInfoExpanded = !this.productInfoExpanded;
            },
            toggleCustomerInfo() {
                this.customerInfoExpanded = !this.customerInfoExpanded;
            },
            togglePaymentInfo() {
                this.paymentInfoExpanded = !this.paymentInfoExpanded;
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
            },
            
            // 解析定制信息
            parseCustomizeInfo(customizeInfo) {
                if (!customizeInfo) return {};
                
                const result = {};
                const lines = customizeInfo.split(/[：:]/);
                
                if (lines.length >= 2) {
                    // 处理"定制内容:戒指款式如图用钻:常规颜色:玫瑰金色尺寸:11"这种格式
                    const content = lines[0];
                    const remaining = lines.slice(1).join(':');
                    
                    // 分割剩余部分
                    const parts = remaining.split(/(?<=[钻色尺寸])/);
                    
                    result['定制内容'] = content;
                    
                    parts.forEach(part => {
                        if (part.includes('钻')) {
                            result['用钻'] = part.replace('钻', '').trim();
                        } else if (part.includes('色')) {
                            result['颜色'] = part.replace('色', '').trim();
                        } else if (part.includes('尺寸')) {
                            result['尺寸'] = part.replace('尺寸', '').trim();
                        }
                    });
                }
                
                return result;
            },
            
            // 打开图片
            openImage(imageUrl) {
                console.log('openImage 被调用，URL:', imageUrl);
                if (imageUrl) {
                    try {
                        // 尝试使用 uxp.shell.openExternal 在默认浏览器中打开
                        const uxp = require('uxp');
                        if (uxp && uxp.shell && uxp.shell.openExternal) {
                            uxp.shell.openExternal(imageUrl);
                            console.log('使用默认浏览器打开图片');
                        } else {
                            console.log('uxp.shell.openExternal 不可用，尝试其他方法');
                            // 备用方案：在插件内显示图片URL
                            this.showImageUrl(imageUrl);
                        }
                    } catch (error) {
                        console.error('打开图片时出错:', error);
                        // 备用方案：在插件内显示图片URL
                        this.showImageUrl(imageUrl);
                    }
                }
            },
            
            // 创建图片浮动窗口
            createImageDialog(imageUrl) {
                try {
                    const uxp = require('uxp');
                    if (uxp && uxp.dialogs) {
                        // 创建一个浮动窗口
                        const dialog = uxp.dialogs.createDialog({
                            title: '参考附件图片',
                            width: 600,
                            height: 500,
                            resizable: true
                        });
                        
                        // 设置窗口内容
                        dialog.content.innerHTML = `
                            <div style="padding: 20px; text-align: center; background: #f5f5f5; height: 100%;">
                                <h3 style="margin: 0 0 20px 0; color: #333;">参考附件图片</h3>
                                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                    <img src="${imageUrl}" alt="参考附件" style="max-width: 100%; max-height: 350px; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
                                </div>
                                <div style="margin-top: 15px;">
                                    <p style="margin: 5px 0; font-size: 12px; color: #666;">
                                        <a href="${imageUrl}" target="_blank" style="color: #1976d2; text-decoration: none; padding: 8px 16px; border: 1px solid #1976d2; border-radius: 4px; background: white;">
                                            在浏览器中打开
                                        </a>
                                    </p>
                                </div>
                            </div>
                        `;
                        
                        // 显示窗口
                        dialog.show();
                        console.log('图片浮动窗口创建成功');
                    }
                } catch (error) {
                    console.error('创建图片浮动窗口时出错:', error);
                    this.showImageUrl(imageUrl);
                }
            },
            
            // 显示图片URL
            showImageUrl(imageUrl) {
                console.log('图片URL:', imageUrl);
                // 在插件内创建一个简单的显示
                const message = `图片URL: ${imageUrl}\n\n请复制此URL到浏览器中打开。`;
                console.log(message);
                // 由于无法使用 alert，我们通过控制台输出信息
                console.log('=== 图片信息 ===');
                console.log('URL:', imageUrl);
                console.log('请复制上述URL到浏览器中打开');
                console.log('================');
            }
        },
        data() {
            return {
                inputText: '', // 输入文本数据
                searchResult: null, // 搜索结果
                isLoading: false, // 加载状态
                errorMessage: '', // 错误信息
                productInfoExpanded: false, // 产品信息展开状态
                customerInfoExpanded: false, // 客户信息展开状态
                paymentInfoExpanded: false // 支付信息展开状态
            }
        },

    }
</script>
