<template>
  <div :class="['card', { 'card-hover': hover, 'card-flat': flat }]">
    <div v-if="$slots.header || title" class="card-header">
      <h3 v-if="title" class="card-title">{{ title }}</h3>
      <slot name="header"></slot>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: ''
  },
  hover: {
    type: Boolean,
    default: false
  },
  flat: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss" scoped>
.card {
  border-radius: var(--border-radius);
  background-color: var(--card-color);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: var(--transition);
  margin-bottom: 1.5rem;
  
  &.card-hover:hover {
    box-shadow: var(--shadow-hover);
    transform: translateY(-2px);
  }
  
  &.card-flat {
    box-shadow: none;
    border: 1px solid var(--border-color);
  }
}

.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.card-body {
  padding: 1.5rem;
}

.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background-color: rgba(0, 0, 0, 0.02);
}
</style>