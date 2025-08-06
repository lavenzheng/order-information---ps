<template>
    <div class="collapsible-section">
        <div @click="$emit('toggle')" class="collapsible-header">
            <div class="collapsible-title">产品信息</div>
            <span class="collapsible-arrow">{{ expanded ? '▼' : '▶' }}</span>
        </div>
        <div v-if="expanded" class="collapsible-content">
            <div class="info-row">
                <div class="info-label">产品编号:</div>
                <div class="info-value product-no">{{ product.product_no }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">产品名称:</div>
                <div class="info-value">{{ product.product_name }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">产品状态:</div>
                <div class="info-value product-status">{{ product.product_status_name }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">产品进度:</div>
                <div class="info-value product-progress">{{ product.child_status_name }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">产品类型:</div>
                <div class="info-value">{{ product.product_type_name }}</div>
            </div>
            <div v-if="product.customize_info" class="info-row">
                <div class="info-label">定制信息:</div>
                <div class="info-value">
                    <div v-for="(line, index) in product.customize_info.split('\n')" :key="index" class="customize-info-line">
                        <span v-if="line.includes(':')" class="customize-info-key">{{ line.split(':')[0] }}:</span>
                        <span v-if="line.includes(':')" class="customize-info-value">{{ line.split(':')[1] }}</span>
                        <span v-else>{{ line }}</span>
                    </div>
                </div>
            </div>
            <div class="info-row">
                <div class="info-label">设计师:</div>
                <div class="info-value">{{ product.editor_name }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">创建时间:</div>
                <div class="info-value">{{ formatDate(product.create_time) }}</div>
            </div>
            <div v-if="product.more_detail && product.more_detail.url" class="info-row">
                <div class="info-label">更多详情:</div>
                <div class="info-value">
                    <a :href="product.more_detail.url" target="_blank" class="more-detail-link">{{ product.more_detail.url }}</a>
                </div>
            </div>
            <div v-if="product.attachments && product.attachments.length > 0 && product.attachments[0].url" class="info-row">
                <div class="info-label">参考附件:</div>
                <div class="info-value">
                    <img :src="product.attachments[0].url" alt="参考附件" class="reference-image" @click="$emit('openImage', product.attachments[0].url)" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { formatDate } from '../utils/formatters';

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
    methods: {
        formatDate
    }
};
</script> 