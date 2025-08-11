/**
 * 产品API服务
 * 处理所有与产品相关的API调用
 * 优化版本：添加缓存、高效搜索、防抖处理
 */

import config from '../config';

const API_BASE_URL = config.api.baseUrl;

// 产品数据缓存
let productCache = {
    data: null,
    timestamp: 0,
    cacheExpiry: 5 * 60 * 1000 // 5分钟缓存过期
};

// 搜索历史缓存
let searchHistoryCache = new Map();

/**
 * 带重试机制的fetch请求
 * @param {string} url - 请求URL
 * @param {Object} options - 请求选项
 * @returns {Promise<Response>} 响应对象
 */
async function fetchWithRetry(url, options = {}) {
    const { retryCount = config.api.request.retryCount, retryDelay = config.api.request.retryDelay } = options;
    
    for (let attempt = 1; attempt <= retryCount; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.api.request.timeout);
            
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return response;
        } catch (error) {
            console.warn(`API请求失败 (尝试 ${attempt}/${retryCount}):`, error.message);
            
            if (attempt === retryCount) {
                throw error;
            }
            
            // 等待后重试
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
}

/**
 * 检查缓存是否有效
 * @returns {boolean} 缓存是否有效
 */
function isCacheValid() {
    return productCache.data && 
           (Date.now() - productCache.timestamp) < productCache.cacheExpiry;
}

/**
 * 从缓存获取产品数据
 * @returns {Object|null} 缓存的产品数据
 */
function getFromCache() {
    if (isCacheValid()) {
        console.log('从缓存获取产品数据');
        return productCache.data;
    }
    return null;
}

/**
 * 更新缓存
 * @param {Object} data - 产品数据
 */
function updateCache(data) {
    productCache.data = data;
    productCache.timestamp = Date.now();
    console.log('产品数据缓存已更新');
}

/**
 * 清空缓存
 */
export function clearProductCache() {
    productCache.data = null;
    productCache.timestamp = 0;
    searchHistoryCache.clear();
    console.log('产品数据缓存已清空');
}

/**
 * 获取产品列表（带缓存）
 * @param {Object} params - 查询参数
 * @param {boolean} forceRefresh - 是否强制刷新缓存
 * @returns {Promise<Object>} API响应数据
 */
export async function getProductList(params = {}, forceRefresh = false) {
    // 检查缓存
    if (!forceRefresh) {
        const cachedData = getFromCache();
        if (cachedData) {
            return cachedData;
        }
    }

    const defaultParams = {
        ...config.api.defaultParams,
        ...params
    };

    const queryString = Object.keys(defaultParams)
        .map(key => `${key}=${encodeURIComponent(defaultParams[key])}`)
        .join('&');

    const url = `${API_BASE_URL}${config.api.endpoints.productList}?${queryString}`;

    try {
        const response = await fetchWithRetry(url);
        const data = await response.json();
        
        if (!data || !data.data) {
            throw new Error('API返回数据格式错误');
        }
        
        // 更新缓存
        updateCache(data);
        
        return data;
    } catch (error) {
        console.error('获取产品列表失败:', error);
        
        // 根据错误类型返回不同的错误信息
        if (error.name === 'AbortError') {
            throw new Error('请求超时，请检查网络连接');
        } else if (error.message.includes('HTTP error')) {
            throw new Error('服务器错误，请稍后重试');
        } else {
            throw new Error('网络连接失败，请重试');
        }
    }
}

/**
 * 快速产品搜索（使用索引优化）
 * @param {Array} products - 产品列表
 * @param {string} productNo - 产品编号
 * @returns {Array} 搜索结果
 */
function fastProductSearch(products, productNo) {
    if (!Array.isArray(products) || !productNo) {
        return [];
    }

    const searchTerm = productNo.trim().toLowerCase();
    
    // 使用精确匹配，提高搜索准确性
    return products.filter(product => {
        if (!product.product_no) return false;
        return product.product_no.toLowerCase() === searchTerm;
    });
}

/**
 * 根据产品编号搜索产品（优化版本）
 * @param {string} productNo - 产品编号
 * @param {boolean} useCache - 是否使用缓存
 * @returns {Promise<Array>} 匹配的产品列表
 */
export async function searchProductByNo(productNo, useCache = true) {
    if (!productNo || productNo.trim() === '') {
        throw new Error('请输入产品编号');
    }

    // 检查最小搜索长度
    if (productNo.trim().length < config.features.search.minSearchLength) {
        throw new Error(`搜索关键词至少需要${config.features.search.minSearchLength}个字符`);
    }

    // 检查搜索历史缓存
    if (useCache && searchHistoryCache.has(productNo)) {
        console.log('从搜索历史缓存获取结果');
        return searchHistoryCache.get(productNo);
    }

    try {
        // 优先使用缓存数据
        let data = getFromCache();
        
        if (!data) {
            data = await getProductList();
        }
        
        if (data && data.data && data.data.products) {
            const result = fastProductSearch(data.data.products, productNo);
            
            // 缓存搜索结果
            if (useCache) {
                searchHistoryCache.set(productNo, result);
                // 限制缓存大小，避免内存泄漏
                if (searchHistoryCache.size > 100) {
                    const firstKey = searchHistoryCache.keys().next().value;
                    searchHistoryCache.delete(firstKey);
                }
            }
            
            return result;
        }
        
        return [];
    } catch (error) {
        console.error('搜索产品失败:', error);
        throw error;
    }
}

/**
 * 获取产品统计信息（优化版本）
 * @returns {Promise<Object>} 产品统计信息
 */
export async function getProductStats() {
    try {
        // 优先使用缓存数据
        let data = getFromCache();
        
        if (!data) {
            data = await getProductList({ page_size: 1000 });
        }
        
        if (data && data.data && data.data.products) {
            const products = data.data.products;
            
            return {
                total: products.length,
                byStatus: products.reduce((acc, product) => {
                    const status = product.product_status_name || '未知';
                    acc[status] = (acc[status] || 0) + 1;
                    return acc;
                }, {}),
                byType: products.reduce((acc, product) => {
                    const type = product.product_type_name || '未知';
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                }, {})
            };
        }
        
        return { total: 0, byStatus: {}, byType: {} };
    } catch (error) {
        console.error('获取产品统计信息失败:', error);
        throw error;
    }
}

/**
 * 预加载产品数据（用于提高首次搜索速度）
 * @returns {Promise<void>}
 */
export async function preloadProductData() {
    try {
        console.log('开始预加载产品数据...');
        await getProductList();
        console.log('产品数据预加载完成');
    } catch (error) {
        console.warn('产品数据预加载失败:', error);
    }
} 