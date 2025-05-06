<template>
  <button
    :class="[
      'btn',
      variant ? `btn-${variant}` : '',
      block ? 'btn-block' : '',
      size ? `btn-${size}` : '',
      { 'is-loading': loading }
    ]"
    :disabled="disabled || loading"
    :type="type"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="spinner"></span>
    <span v-if="icon && !loading" class="mdi" :class="`mdi-${icon}`"></span>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'outline', 'danger', 'success'].includes(value)
  },
  size: {
    type: String,
    default: '',
    validator: (value: string) => ['', 'sm', 'lg'].includes(value)
  },
  block: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  type: {
    type: String as () => 'button' | 'submit' | 'reset',
    default: 'button'
  }
})

defineEmits(['click'])
</script>

<style lang="scss" scoped>
.btn {
  position: relative;

  &.is-loading {
    color: transparent !important;
    pointer-events: none;
  }

  &.btn-sm {
    padding: 0.4rem 0.8rem;
    font-size: 0.875rem;
  }

  &.btn-lg {
    padding: 0.8rem 1.5rem;
    font-size: 1.125rem;
  }
}

.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1.2em;
  height: 1.2em;
  margin-top: -0.6em;
  margin-left: -0.6em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner 0.75s linear infinite;
}

@keyframes spinner {
  to {
    transform: rotate(360deg);
  }
}
</style>
