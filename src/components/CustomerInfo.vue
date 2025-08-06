<template>
    <div v-if="product.customer" class="collapsible-section">
        <div @click="$emit('toggle')" class="collapsible-header">
            <div class="collapsible-title">客户信息</div>
            <span class="collapsible-arrow">{{ expanded ? '▼' : '▶' }}</span>
        </div>
        <div v-if="expanded" class="collapsible-content">
            <div class="info-row">
                <div class="info-label">客户姓名:</div>
                <div class="info-value">{{ product.customer.name }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">客户编号:</div>
                <div class="info-value customer-no">{{ product.customer.customer_no }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">邮箱:</div>
                <div class="info-value">{{ product.customer.email }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">电话:</div>
                <div class="info-value">{{ product.customer.phone }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">账单地址:</div>
                <div class="info-value address-text">{{ formatAddress(product.customer.billing_address) }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">收货地址:</div>
                <div class="info-value address-text">{{ formatAddress(product.customer.shipping_address) }}</div>
            </div>
            <div v-if="product.customer.memo" class="info-row">
                <div class="info-label">备注:</div>
                <div class="info-value address-text">{{ product.customer.memo }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import { formatAddress } from '../utils/formatters';

export default {
    name: 'CustomerInfo',
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
        formatAddress
    }
};
</script> 