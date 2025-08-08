/**
 * XMP元数据工具
 * 用于通过XMP元数据传递参数
 */

const XMP_NAMESPACE = "http://example.com/mypsns/1.0/";
const XMP_PREFIX = "myps";

/**
 * 从当前文档的XMP元数据中读取参数
 * @returns {Promise<Object|null>} 解析后的参数对象
 */
export async function readParamsFromXMP() {
    try {
        console.log('=== 开始从XMP元数据读取参数 ===');
        
        const ps = require('photoshop');
        
        // 检查是否有活动文档
        if (!ps.app.activeDocument) {
            console.log('没有活动文档，无法读取XMP元数据');
            return null;
        }
        
        // 添加超时保护
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('XMP读取超时')), 10000);
        });
        
        // 获取当前文档的XMP元数据
        const xmpPromise = ps.action.batchPlay([{
            _obj: 'get',
            _target: [{ _ref: 'document', _id: ps.app.activeDocument.id }],
            _options: { rawTrue: true }
        }], { synchronousExecution: true, modalBehavior: 'fail' });
        
        const result = await Promise.race([xmpPromise, timeoutPromise]);
        const [{ xmpMetadata }] = result;
        
        console.log('获取到XMP元数据:', xmpMetadata ? '成功' : '失败');
        
        if (!xmpMetadata) {
            console.log('文档中没有XMP元数据');
            return null;
        }
        
        // 解析XML
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmpMetadata, "text/xml");
        
        // 查找我们的命名空间下的params节点
        const node = doc.getElementsByTagNameNS(XMP_NAMESPACE, "params")[0];
        
        if (!node) {
            console.log('XMP元数据中没有找到params节点');
            return null;
        }
        
        // 解析JSON数据
        const data = JSON.parse(node.textContent);
        console.log('成功从XMP元数据读取参数:', data);
        
        return data;
        
    } catch (error) {
        console.error('从XMP元数据读取参数失败:', error);
        return null;
    }
}

/**
 * 将参数写入当前文档的XMP元数据
 * @param {Object} params 要写入的参数对象
 * @returns {Promise<boolean>} 是否成功写入
 */
export async function writeParamsToXMP(params) {
    try {
        console.log('=== 开始写入参数到XMP元数据 ===');
        console.log('要写入的参数:', params);
        
        const ps = require('photoshop');
        
        // 检查是否有活动文档
        if (!ps.app.activeDocument) {
            console.log('没有活动文档，无法写入XMP元数据');
            return false;
        }
        
        // 添加超时保护
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('XMP写入超时')), 15000);
        });
        
        // 获取当前文档的XMP元数据
        const getPromise = ps.action.batchPlay([{
            _obj: 'get',
            _target: [{ _ref: 'document', _id: ps.app.activeDocument.id }],
            _options: { rawTrue: true }
        }], { synchronousExecution: true, modalBehavior: 'fail' });
        
        const getResult = await Promise.race([getPromise, timeoutPromise]);
        const [{ xmpMetadata }] = getResult;
        
        // 解析现有的XMP元数据
        let doc;
        if (xmpMetadata) {
            const parser = new DOMParser();
            doc = parser.parseFromString(xmpMetadata, "text/xml");
        } else {
            // 创建新的XMP文档
            doc = new DOMParser().parseFromString(
                '<?xml version="1.0" encoding="UTF-8"?><x:xmpmeta xmlns:x="adobe:ns:meta/"></x:xmpmeta>',
                "text/xml"
            );
        }
        
        // 获取根元素
        const root = doc.documentElement;
        
        // 添加我们的命名空间声明
        root.setAttribute(`xmlns:${XMP_PREFIX}`, XMP_NAMESPACE);
        
        // 查找或创建params节点
        let paramsNode = doc.getElementsByTagNameNS(XMP_NAMESPACE, "params")[0];
        if (!paramsNode) {
            paramsNode = doc.createElementNS(XMP_NAMESPACE, `${XMP_PREFIX}:params`);
            root.appendChild(paramsNode);
        }
        
        // 写入参数数据
        paramsNode.textContent = JSON.stringify(params);
        
        // 将修改后的XMP元数据写回文档
        const newXmpMetadata = new XMLSerializer().serializeToString(doc);
        
        const setPromise = ps.action.batchPlay([{
            _obj: 'set',
            _target: [{ _ref: 'document', _id: ps.app.activeDocument.id }],
            _options: { rawTrue: true },
            xmpMetadata: newXmpMetadata
        }], { synchronousExecution: true, modalBehavior: 'fail' });
        
        await Promise.race([setPromise, timeoutPromise]);
        
        console.log('成功写入参数到XMP元数据');
        return true;
        
    } catch (error) {
        console.error('写入参数到XMP元数据失败:', error);
        return false;
    }
}

/**
 * 清除XMP元数据中的参数
 * @returns {Promise<boolean>} 是否成功清除
 */
export async function clearParamsFromXMP() {
    try {
        console.log('=== 开始清除XMP元数据中的参数 ===');
        
        const ps = require('photoshop');
        
        // 检查是否有活动文档
        if (!ps.app.activeDocument) {
            console.log('没有活动文档，无法清除XMP元数据');
            return false;
        }
        
        // 获取当前文档的XMP元数据
        const [{ xmpMetadata }] = await ps.action.batchPlay([{
            _obj: 'get',
            _target: [{ _ref: 'document', _id: ps.app.activeDocument.id }],
            _options: { rawTrue: true }
        }], { synchronousExecution: true, modalBehavior: 'fail' });
        
        if (!xmpMetadata) {
            console.log('文档中没有XMP元数据');
            return true;
        }
        
        // 解析XML
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmpMetadata, "text/xml");
        
        // 查找并删除params节点
        const paramsNode = doc.getElementsByTagNameNS(XMP_NAMESPACE, "params")[0];
        if (paramsNode) {
            paramsNode.parentNode.removeChild(paramsNode);
            console.log('已删除params节点');
        }
        
        // 将修改后的XMP元数据写回文档
        const newXmpMetadata = new XMLSerializer().serializeToString(doc);
        
        await ps.action.batchPlay([{
            _obj: 'set',
            _target: [{ _ref: 'document', _id: ps.app.activeDocument.id }],
            _options: { rawTrue: true },
            xmpMetadata: newXmpMetadata
        }], { synchronousExecution: true, modalBehavior: 'fail' });
        
        console.log('成功清除XMP元数据中的参数');
        return true;
        
    } catch (error) {
        console.error('清除XMP元数据中的参数失败:', error);
        return false;
    }
}

/**
 * 检查当前文档是否有XMP参数
 * @returns {Promise<boolean>} 是否有参数
 */
export async function hasXMPParams() {
    try {
        const params = await readParamsFromXMP();
        return params !== null;
    } catch (error) {
        console.error('检查XMP参数失败:', error);
        return false;
    }
} 