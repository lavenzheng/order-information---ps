/**
 * 格式化工具函数
 * 提供日期、货币、地址等格式化功能
 */

/**
 * 格式化日期
 * @param {string} dateString - 日期字符串
 * @returns {string} 格式化后的日期
 */
export function formatDate(dateString) {
    if (!dateString) return '未提供';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return '日期格式错误';
        }
        
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (error) {
        console.error('日期格式化错误:', error);
        return '日期格式错误';
    }
}

/**
 * 格式化货币
 * @param {number|string} amount - 金额
 * @returns {string} 格式化后的货币
 */
export function formatCurrency(amount) {
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
        console.error('货币格式化错误:', error);
        return '0.00';
    }
}

/**
 * 格式化地址
 * @param {string} address - 地址字符串
 * @returns {string} 格式化后的地址
 */
export function formatAddress(address) {
    if (!address) return '未提供';
    
    // 移除多余的空白字符
    return address.trim().replace(/\s+/g, ' ');
}

/**
 * 解析定制信息
 * @param {string} customizeInfo - 定制信息字符串
 * @returns {Array} 解析后的定制信息数组
 */
export function parseCustomizeInfo(customizeInfo) {
    if (!customizeInfo) return [];
    
    try {
        return customizeInfo.split('\n').filter(line => line.trim() !== '');
    } catch (error) {
        console.error('定制信息解析错误:', error);
        return [];
    }
} 