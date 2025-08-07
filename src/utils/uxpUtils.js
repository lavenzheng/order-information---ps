/**
 * UXP工具函数
 * 处理UXP相关的功能
 */

import config from '../config';

/**
 * 在默认浏览器中打开URL
 * @param {string} url - 要打开的URL
 * @returns {boolean} 是否成功打开
 */
export function openExternalUrl(url) {
    if (!url) {
        console.error('URL不能为空');
        return false;
    }

    try {
        const uxp = require('uxp');
        if (uxp && uxp.shell && uxp.shell.openExternal) {
            uxp.shell.openExternal(url);
            console.log('使用默认浏览器打开URL:', url);
            return true;
        } else {
            console.log('uxp.shell.openExternal 不可用');
            return false;
        }
    } catch (error) {
        console.error('打开外部URL时出错:', error);
        return false;
    }
}

/**
 * 创建图片对话框
 * @param {string} imageUrl - 图片URL
 * @param {Object} options - 对话框选项
 * @returns {boolean} 是否成功创建对话框
 */
export function createImageDialog(imageUrl, options = {}) {
    if (!imageUrl) {
        console.error('图片URL不能为空');
        return false;
    }

    const defaultOptions = {
        title: '参考附件',
        width: 600,
        height: 400,
        resizable: true,
        ...options
    };

    try {
        const uxp = require('uxp');
        if (uxp && uxp.dialogs && uxp.dialogs.createDialog) {
            const dialog = uxp.dialogs.createDialog(defaultOptions);

            dialog.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <img src="${imageUrl}" alt="参考附件" 
                         style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                </div>
            `;

            dialog.show();
            console.log('创建图片对话框成功');
            return true;
        } else {
            console.log('uxp.dialogs.createDialog 不可用');
            return false;
        }
    } catch (error) {
        console.error('创建图片对话框时出错:', error);
        return false;
    }
}

/**
 * 显示通知消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 (info, success, warning, error)
 * @param {number} duration - 显示时长（毫秒）
 */
export function showNotification(message, type = 'info', duration = 3000) {
    try {
        const uxp = require('uxp');
        if (uxp && uxp.notifications) {
            uxp.notifications.show(message, {
                type: type,
                duration: duration
            });
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    } catch (error) {
        console.error('显示通知失败:', error);
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

/**
 * 获取系统信息
 * @returns {Object} 系统信息
 */
export function getSystemInfo() {
    try {
        const uxp = require('uxp');
        const os = require('os');
        
        return {
            platform: os.platform(),
            arch: os.arch(),
            version: os.version(),
            hostname: os.hostname(),
            userInfo: os.userInfo(),
            uxpVersion: uxp.version || 'unknown'
        };
    } catch (error) {
        console.error('获取系统信息失败:', error);
        return {};
    }
}

/**
 * 保存文件到本地
 * @param {string} content - 文件内容
 * @param {string} filename - 文件名
 * @param {string} mimeType - MIME类型
 * @returns {boolean} 是否成功保存
 */
export function saveFile(content, filename, mimeType = 'text/plain') {
    try {
        const uxp = require('uxp');
        if (uxp && uxp.storage) {
            const file = uxp.storage.createFile(filename);
            file.write(content);
            console.log('文件保存成功:', filename);
            return true;
        } else {
            console.log('uxp.storage 不可用');
            return false;
        }
    } catch (error) {
        console.error('保存文件失败:', error);
        return false;
    }
}

/**
 * 读取本地文件
 * @param {string} filename - 文件名
 * @returns {string|null} 文件内容
 */
export function readFile(filename) {
    try {
        const uxp = require('uxp');
        if (uxp && uxp.storage) {
            const file = uxp.storage.getFile(filename);
            if (file && file.exists) {
                return file.read();
            }
        }
        return null;
    } catch (error) {
        console.error('读取文件失败:', error);
        return null;
    }
}

/**
 * 检查网络连接状态
 * @returns {Promise<boolean>} 是否连接
 */
export async function checkNetworkConnection() {
    try {
        const response = await fetch('https://www.google.com', { 
            method: 'HEAD',
            mode: 'no-cors'
        });
        return true;
    } catch (error) {
        console.error('网络连接检查失败:', error);
        return false;
    }
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, delay = 300) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, limit = 300) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 显示图片URL信息
 * @param {string} imageUrl - 图片URL
 */
export function showImageUrl(imageUrl) {
    console.log('图片URL:', imageUrl);
    showNotification(`图片URL: ${imageUrl}`, 'info');
} 