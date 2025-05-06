<template>
  <transition name="fade">
    <div 
      v-if="show" 
      :class="['alert', `alert-${type}`, { 'alert-dismissible': dismissible }]"
      role="alert"
    >
      <div class="alert-icon" v-if="icon">
        <span class="mdi" :class="`mdi-${icon}`"></span>
      </div>
      <div class="alert-content">
        <div v-if="title" class="alert-title">{{ title }}</div>
        <div class="alert-message">
          <slot>{{ message }}</slot>
        </div>
      </div>
      <button 
        v-if="dismissible" 
        class="alert-close" 
        @click="dismiss"
        aria-label="Close"
      >
        <span class="mdi mdi-close"></span>
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value: string) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  dismissible: {
    type: Boolean,
    default: false
  },
  autoClose: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number,
    default: 5000
  },
  modelValue: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

// Internal show state
const internalShow = ref(props.modelValue)

// Computed show state that combines internal and external control
const show = computed({
  get: () => internalShow.value && props.modelValue,
  set: (value) => {
    internalShow.value = value
    emit('update:modelValue', value)
  }
})

// Default icons based on type
const icon = computed(() => {
  if (props.icon) return props.icon

  switch (props.type) {
    case 'info':
      return 'information-outline'
    case 'success':
      return 'check-circle-outline'
    case 'warning':
      return 'alert-outline'
    case 'error':
      return 'alert-circle-outline'
    default:
      return ''
  }
})

// Auto-close timer
let timer: number | null = null

function startAutoCloseTimer() {
  if (props.autoClose && props.duration > 0) {
    timer = window.setTimeout(() => {
      dismiss()
    }, props.duration)
  }
}

function clearAutoCloseTimer() {
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
}

function dismiss() {
  show.value = false
  emit('close')
}

// Watch for changes in autoClose or duration
watch(() => props.autoClose, (newVal) => {
  if (newVal && show.value) {
    startAutoCloseTimer()
  } else {
    clearAutoCloseTimer()
  }
})

watch(() => props.duration, () => {
  if (props.autoClose && show.value) {
    clearAutoCloseTimer()
    startAutoCloseTimer()
  }
})

// Watch for external modelValue changes
watch(() => props.modelValue, (newVal) => {
  if (newVal !== internalShow.value) {
    internalShow.value = newVal
  }

  if (newVal && props.autoClose) {
    startAutoCloseTimer()
  }
})

// Start auto-close timer if needed
if (show.value && props.autoClose) {
  startAutoCloseTimer()
}
</script>

<style scoped>
.alert {
  display: flex;
  padding: 1rem;
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
  position: relative;
}

.alert.alert-info {
  background-color: rgba(var(--primary-color-rgb, 108, 92, 231), 0.1);
  border-left: 4px solid var(--primary-color);
}

.alert.alert-info .alert-icon {
  color: var(--primary-color);
}

.alert.alert-success {
  background-color: rgba(var(--success-color-rgb, 85, 239, 196), 0.1);
  border-left: 4px solid var(--success-color);
}

.alert.alert-success .alert-icon {
  color: var(--success-color);
}

.alert.alert-warning {
  background-color: rgba(var(--warning-color-rgb, 255, 234, 167), 0.1);
  border-left: 4px solid var(--warning-color);
}

.alert.alert-warning .alert-icon {
  color: #c4b366; /* Equivalent to color.adjust(#ffeaa7, $lightness: -30%) */
}

.alert.alert-error {
  background-color: rgba(var(--danger-color-rgb, 255, 118, 117), 0.1);
  border-left: 4px solid var(--danger-color);
}

.alert.alert-error .alert-icon {
  color: var(--danger-color);
}

.alert.alert-dismissible {
  padding-right: 3rem;
}

.alert-icon {
  display: flex;
  align-items: center;
  margin-right: 0.75rem;
}

.alert-icon .mdi {
  font-size: 1.5rem;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.alert-message {
  color: var(--text-color);
}

.alert-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-light);
  border-radius: 50%;
  transition: background-color 0.2s;
}

.alert-close:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.alert-close .mdi {
  font-size: 1.25rem;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
