/**
 * 应用配置文件
 * 集中管理所有配置项
 */

export const config = {
    // API配置
    api: {
        baseUrl: 'https://ordertrack.365d4u.com/api',
        endpoints: {
            productList: '/product/list'
        },
        defaultParams: {
            page: 1,
            page_size: 100,
            attribute: 0,
            upload: 0
        }
    },
    
    // UI配置
    ui: {
        // 默认展开状态
        defaultExpanded: {
            productInfo: false,
            customerInfo: false,
            paymentInfo: false
        },
        
        // 样式配置
        styles: {
            primaryColor: '#1976d2',
            errorColor: '#d32f2f',
            successColor: '#2e7d32',
            warningColor: '#f57c00'
        }
    },
    
    // 功能配置
    features: {
        // 是否启用图片预览
        enableImagePreview: true,
        
        // 是否启用外部链接
        enableExternalLinks: true,
        
        // 搜索配置
        search: {
            // 是否区分大小写
            caseSensitive: false,
            
            // 是否启用模糊搜索
            fuzzySearch: false
        }
    }
};

export default config; 