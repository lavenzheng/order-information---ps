<template>
    <div class="collapsible-section">
        <div @click="$emit('toggle')" class="collapsible-header">
            <div class="collapsible-title">产品信息</div>
            <span class="collapsible-arrow">{{ expanded ? '▼' : '▶' }}</span>
        </div>
        <div v-if="expanded" class="collapsible-content">
            <div class="info-row">
                <div class="info-label">产品编号:</div>
                <div class="info-value product-no">{{ product.product_no || '未提供' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">产品名称:</div>
                <div class="info-value">{{ product.product_name || '未提供' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">产品状态:</div>
                <div class="info-value product-status">{{ product.product_status_name || '未提供' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">产品进度:</div>
                <div class="info-value product-progress">{{ product.child_status_name || '未提供' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">产品类型:</div>
                <div class="info-value">{{ product.product_type_name || '未提供' }}</div>
            </div>
            <div v-if="product.customize_info" class="info-row">
                <div class="info-label">定制信息:</div>
                <div class="info-value">
                    <div v-for="(line, index) in parseCustomizeInfo(product.customize_info)" :key="index" class="customize-info-line">
                        <span v-if="line.includes(':')" class="customize-info-key">{{ line.split(':')[0] }}:</span>
                        <span v-if="line.includes(':')" class="customize-info-value">{{ line.split(':')[1] }}</span>
                        <span v-else>{{ line }}</span>
                    </div>
                </div>
            </div>
            <div class="info-row">
                <div class="info-label">设计师:</div>
                <div class="info-value">{{ product.editor_name || '未提供' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">创建时间:</div>
                <div class="info-value">{{ formatDate(product.create_time) }}</div>
            </div>
            <div v-if="product.more_detail && product.more_detail.url" class="info-row">
                <div class="info-label">更多详情:</div>
                <div class="info-value">
                    <a :href="product.more_detail.url" target="_blank" class="more-detail-link" @click="openExternalLink(product.more_detail.url)">
                        {{ product.more_detail.url }}
                    </a>
                </div>
            </div>
            <div v-if="product.attachments && product.attachments.length > 0" class="info-row">
                <div class="info-label">参考附件:</div>
                <div class="info-value">
                    <!-- 调试信息 -->
                    <div style="color: red; font-size: 12px; margin-bottom: 5px;">
                        调试: 附件数量 {{ product.attachments.length }}, 图片数量 {{ imageAttachments.length }}
                    </div>
                    
                    <div class="attachments-container">
                        <img 
                            v-for="(attachment, index) in imageAttachments" 
                            :key="index"
                            :src="attachment.url" 
                            :alt="`参考附件 ${index + 1}`" 
                            class="reference-image" 
                            @click="$emit('openImage', attachment.url)"
                            @error="handleImageError"
                            @load="handleImageLoad"
                        />
                    </div>
                    <div v-if="imageAttachments.length > 0" class="attachments-info">
                        共 {{ imageAttachments.length }} 张图片，点击查看大图
                    </div>
                    <div v-else class="attachments-info" style="color: orange;">
                        没有找到有效的图片附件
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { formatDate, parseCustomizeInfo } from '../utils/formatters';
import { openExternalUrl } from '../utils/uxpUtils';

export default {
    name: 'ProductInfo',
    props: {
        product: {
            type: Object,
            required: true
        },
        expanded: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        // 过滤出图片类型的附件
        imageAttachments() {
            if (!this.product.attachments || !Array.isArray(this.product.attachments)) {
                console.log('没有附件或附件不是数组');
                return [];
            }
            
            console.log('原始附件数据:', this.product.attachments);
            
            const filtered = this.product.attachments.filter(attachment => {
                // 简化过滤逻辑：只要有URL就认为是图片
                const isValid = attachment && attachment.url;
                console.log('检查附件:', attachment, '是否有效:', isValid);
                return isValid;
            });
            
            console.log('过滤后的图片附件:', filtered);
            return filtered;
        }
    },
    methods: {
        formatDate,
        parseCustomizeInfo,
        openExternalLink(url) {
            openExternalUrl(url);
        },
        handleImageError(event) {
            // 图片加载失败时的处理
            console.warn('图片加载失败:', event.target.src);
            event.target.style.display = 'none';
        },
        handleImageLoad(event) {
            // 图片加载成功时的处理
            console.log('图片加载成功:', event.target.src);
        }
    }
};
</script> 