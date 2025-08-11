/**
 * 应用配置文件
 * 集中管理所有配置项
 * 优化版本：添加性能相关配置
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
        },
        // API请求配置
        request: {
            timeout: 10000, // 10秒超时
            retryCount: 3,  // 重试次数
            retryDelay: 1000 // 重试延迟
        },
        // 缓存配置
        cache: {
            enabled: true,
            expiryTime: 5 * 60 * 1000, // 5分钟缓存过期
            maxSize: 100, // 最大缓存条目数
            preloadOnStartup: true // 启动时预加载
        }
    },
    
    // UI配置
    ui: {
        // 默认展开状态
        defaultExpanded: {
            productInfo: true,   // 默认展开产品信息
            customerInfo: false, // 默认收起客户信息
            paymentInfo: false   // 默认收起支付信息
        },
        
        // 样式配置
        styles: {
            primaryColor: '#1976d2',
            errorColor: '#d32f2f',
            successColor: '#2e7d32',
            warningColor: '#f57c00',
            backgroundColor: '#f9f9f9',
            borderColor: '#ddd'
        },
        
        // 布局配置
        layout: {
            searchAreaHeight: 60,
            resultsTopOffset: 60,
            resultsPadding: 8
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
            // 搜索功能配置
            enableRealTimeSearch: false,  // 禁用实时搜索
            debounceDelay: 0,            // 禁用防抖延迟
            minSearchLength: 1,          // 最小搜索字符数
            caseSensitive: false,        // 是否区分大小写
            fuzzySearch: false           // 禁用模糊搜索
        },
        
        // 错误处理配置
        errorHandling: {
            // 是否显示详细错误信息
            showDetailedErrors: false,
            
            // 错误消息显示时间（毫秒）
            errorDisplayTime: 5000
        },
        
        // 性能优化配置
        performance: {
            // 是否启用懒加载
            enableLazyLoading: true,
            
            // 是否启用虚拟滚动（大量数据时）
            enableVirtualScrolling: false,
            
            // 图片加载优化
            imageOptimization: {
                // 是否启用图片预加载
                enablePreload: true,
                
                // 图片加载超时时间
                loadTimeout: 10000,
                
                // 是否启用图片压缩
                enableCompression: false
            }
        }
    },
    
    // 本地化配置
    localization: {
        language: 'zh-CN',
        messages: {
            searchPlaceholder: '请输入产品编号...',
            searchLabel: '产品编号搜索',
            searchButton: '搜索',
            clearButton: '清空',
            loadingText: '正在搜索中...',
            noResultsText: '未找到匹配的产品编号',
            errorMessages: {
                emptyInput: '请输入产品编号',
                networkError: '网络连接失败，请重试',
                apiError: 'API请求失败，请重试',
                unknownError: '未知错误，请重试'
            },
            performanceMessages: {
                cacheHit: '缓存命中，搜索速度提升',
                preloadComplete: '数据预加载完成',
                searchComplete: '搜索完成'
            }
        }
    }
};

export default config; 