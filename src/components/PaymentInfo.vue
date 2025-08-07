<template>
    <div class="collapsible-section">
        <div @click="$emit('toggle')" class="collapsible-header">
            <div class="collapsible-title">支付信息</div>
            <span class="collapsible-arrow">{{ expanded ? '▼' : '▶' }}</span>
        </div>
        <div v-if="expanded" class="collapsible-content">
            <div class="info-row">
                <div class="info-label">总价:</div>
                <div class="info-value total-price">${{ formatCurrency(product.total_price) }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">已付金额:</div>
                <div class="info-value paid-amount">${{ formatCurrency(product.total_pay) }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">首付:</div>
                <div class="info-value">${{ formatCurrency(product.first_pay) }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">二次付款:</div>
                <div class="info-value">${{ formatCurrency(product.second_pay) }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">三次付款:</div>
                <div class="info-value">${{ formatCurrency(product.third_pay) }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">尾款:</div>
                <div class="info-value">${{ formatCurrency(product.last_pay) }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">支付状态:</div>
                <div class="info-value">{{ product.pay_status_name || '未提供' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">剩余金额:</div>
                <div class="info-value remaining-amount">${{ formatCurrency(remainingAmount) }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import { formatCurrency } from '../utils/formatters';

export default {
    name: 'PaymentInfo',
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
        remainingAmount() {
            const totalPrice = parseFloat(this.product.total_price) || 0;
            const totalPaid = parseFloat(this.product.total_pay) || 0;
            return Math.max(0, totalPrice - totalPaid);
        }
    },
    methods: {
        formatCurrency
    }
};
</script> 