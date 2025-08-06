/**
 * 产品API服务
 * 处理所有与产品相关的API调用
 */

const API_BASE_URL = 'https://ordertrack.365d4u.com/api';

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
        page: 1,
        page_size: 100,
        attribute: 0,
        upload: 0,
        ...params
    };

    const queryString = Object.keys(defaultParams)
        .map(key => `${key}=${defaultParams[key]}`)
        .join('&');

    const url = `${API_BASE_URL}/product/list?${queryString}`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取产品列表失败:', error);
        throw error;
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

    try {
        const data = await getProductList();
        
        if (data && data.data && data.data.products) {
            // 使用 find 进行精确匹配（不区分大小写）
            const matchedProduct = data.data.products.find(product => 
                product.product_no && 
                product.product_no.toLowerCase() === productNo.toLowerCase()
            );
            
            return matchedProduct ? [matchedProduct] : [];
        }
        
        return [];
    } catch (error) {
        console.error('搜索产品失败:', error);
        throw error;
    }
} 