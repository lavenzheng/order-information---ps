/**
 * 产品API服务
 * 处理所有与产品相关的API调用
 */

import config from '../config';

const API_BASE_URL = config.api.baseUrl;

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
 * 获取产品列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.page_size - 每页数量
 * @param {number} params.attribute - 属性
 * @param {number} params.upload - 上传状态
 * @returns {Promise<Object>} API响应数据
 */
export async function getProductList(params = {}) {
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
 * 根据产品编号搜索产品
 * @param {string} productNo - 产品编号
 * @returns {Promise<Array>} 匹配的产品列表
 */
export async function searchProductByNo(productNo) {
    if (!productNo || productNo.trim() === '') {
        throw new Error('请输入产品编号');
    }

    // 检查最小搜索长度
    if (productNo.trim().length < config.features.search.minSearchLength) {
        throw new Error(`搜索关键词至少需要${config.features.search.minSearchLength}个字符`);
    }

    try {
        const data = await getProductList();
        
        if (data && data.data && data.data.products) {
            const searchTerm = productNo.trim().toLowerCase();
            
            // 根据配置决定是否区分大小写
            const matchedProduct = data.data.products.find(product => {
                if (!product.product_no) return false;
                
                const productNoLower = config.features.search.caseSensitive 
                    ? product.product_no 
                    : product.product_no.toLowerCase();
                
                return productNoLower === searchTerm;
            });
            
            return matchedProduct ? [matchedProduct] : [];
        }
        
        return [];
    } catch (error) {
        console.error('搜索产品失败:', error);
        throw error;
    }
}

/**
 * 获取产品统计信息
 * @returns {Promise<Object>} 产品统计信息
 */
export async function getProductStats() {
    try {
        const data = await getProductList({ page_size: 1000 }); // 获取所有产品用于统计
        
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