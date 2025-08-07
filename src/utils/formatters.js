/**
 * 格式化工具函数
 * 提供日期、货币、地址等格式化功能
 */

/**
 * 格式化日期
 * @param {string} dateString - 日期字符串
 * @param {Object} options - 格式化选项
 * @returns {string} 格式化后的日期
 */
export function formatDate(dateString, options = {}) {
    if (!dateString) return '未提供';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return '日期格式错误';
        }
        
        const defaultOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            ...options
        };
        
        return date.toLocaleString('zh-CN', defaultOptions);
    } catch (error) {
        console.error('日期格式化错误:', error);
        return '日期格式错误';
    }
}

/**
 * 格式化货币
 * @param {number|string} amount - 金额
 * @param {string} currency - 货币符号
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的货币
 */
export function formatCurrency(amount, currency = '$', decimals = 2) {
    if (amount === null || amount === undefined || amount === '') {
        return `${currency}0.${'0'.repeat(decimals)}`;
    }
    
    try {
        const num = parseFloat(amount);
        if (isNaN(num)) {
            return `${currency}0.${'0'.repeat(decimals)}`;
        }
        
        return `${currency}${num.toFixed(decimals)}`;
    } catch (error) {
        console.error('货币格式化错误:', error);
        return `${currency}0.${'0'.repeat(decimals)}`;
    }
}

/**
 * 格式化地址
 * @param {string} address - 地址字符串
 * @param {number} maxLength - 最大长度
 * @returns {string} 格式化后的地址
 */
export function formatAddress(address, maxLength = 100) {
    if (!address) return '未提供';
    
    // 移除多余的空白字符
    let formatted = address.trim().replace(/\s+/g, ' ');
    
    // 如果地址过长，截断并添加省略号
    if (formatted.length > maxLength) {
        formatted = formatted.substring(0, maxLength) + '...';
    }
    
    return formatted;
}

/**
 * 解析定制信息
 * @param {string} customizeInfo - 定制信息字符串
 * @returns {Array} 解析后的定制信息数组
 */
export function parseCustomizeInfo(customizeInfo) {
    if (!customizeInfo) return [];
    
    try {
        return customizeInfo
            .split('\n')
            .map(line => line.trim())
            .filter(line => line !== '');
    } catch (error) {
        console.error('定制信息解析错误:', error);
        return [];
    }
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的文件大小
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化电话号码
 * @param {string} phone - 电话号码
 * @returns {string} 格式化后的电话号码
 */
export function formatPhoneNumber(phone) {
    if (!phone) return '未提供';
    
    // 移除所有非数字字符
    const cleaned = phone.replace(/\D/g, '');
    
    // 根据长度格式化
    if (cleaned.length === 11) {
        return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 7)}-${cleaned.substring(7)}`;
    } else if (cleaned.length === 10) {
        return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    }
    
    return phone; // 如果无法格式化，返回原值
}

/**
 * 格式化邮箱地址
 * @param {string} email - 邮箱地址
 * @returns {string} 格式化后的邮箱地址
 */
export function formatEmail(email) {
    if (!email) return '未提供';
    
    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return '邮箱格式错误';
    }
    
    return email.toLowerCase();
}

/**
 * 截断文本
 * @param {string} text - 原文本
 * @param {number} maxLength - 最大长度
 * @param {string} suffix - 后缀
 * @returns {string} 截断后的文本
 */
export function truncateText(text, maxLength = 50, suffix = '...') {
    if (!text) return '';
    
    if (text.length <= maxLength) {
        return text;
    }
    
    return text.substring(0, maxLength) + suffix;
}

/**
 * 格式化百分比
 * @param {number} value - 数值
 * @param {number} total - 总数
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的百分比
 */
export function formatPercentage(value, total, decimals = 1) {
    if (total === 0) return '0%';
    
    const percentage = (value / total) * 100;
    return `${percentage.toFixed(decimals)}%`;
} 