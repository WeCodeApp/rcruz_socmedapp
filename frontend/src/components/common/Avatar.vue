<template>
  <div 
    :class="[
      'avatar', 
      `avatar-${size}`,
      { 'avatar-clickable': clickable }
    ]"
    @click="clickable ? $emit('click') : null"
  >
    <img 
      v-if="src" 
      :src="src" 
      :alt="alt || 'User avatar'" 
      class="avatar-image"
      @error="handleImageError"
    />
    <div v-else-if="initials" class="avatar-initials" :style="{ backgroundColor: bgColor }">
      {{ initials }}
    </div>
    <div v-else class="avatar-placeholder">
      <span class="mdi mdi-account"></span>
    </div>
    <div v-if="status" :class="['avatar-status', `status-${status}`]"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  status: {
    type: String,
    default: '',
    validator: (value: string) => ['', 'online', 'offline', 'busy', 'away'].includes(value)
  },
  bgColor: {
    type: String,
    default: ''
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'error'])

const imgError = ref(false)

// Generate initials from name
const initials = computed(() => {
  if (imgError.value && props.src) return getInitials(props.name)
  if (!props.src && props.name) return getInitials(props.name)
  return ''
})

// Generate random background color if not provided
const bgColor = computed(() => {
  if (props.bgColor) return props.bgColor
  
  // Generate a color based on the name (for consistency)
  if (props.name) {
    const hash = props.name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)
    
    const hue = Math.abs(hash % 360)
    return `hsl(${hue}, 70%, 60%)`
  }
  
  return 'var(--primary-color)'
})

function getInitials(name: string): string {
  if (!name) return ''
  
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function handleImageError(event: Event) {
  imgError.value = true
  emit('error', event)
}
</script>

<style lang="scss" scoped>
.avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--background-color);
  color: var(--text-color);
  
  &.avatar-clickable {
    cursor: pointer;
    transition: transform 0.2s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--border-color);
  
  .mdi {
    font-size: 75%;
    color: var(--text-light);
  }
}

.avatar-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 25%;
  height: 25%;
  border-radius: 50%;
  border: 2px solid var(--card-color);
  
  &.status-online {
    background-color: var(--success-color);
  }
  
  &.status-offline {
    background-color: var(--text-light);
  }
  
  &.status-busy {
    background-color: var(--danger-color);
  }
  
  &.status-away {
    background-color: var(--warning-color);
  }
}

// Size variants
.avatar-xs {
  width: 24px;
  height: 24px;
  font-size: 10px;
  
  .avatar-status {
    border-width: 1px;
  }
}

.avatar-sm {
  width: 32px;
  height: 32px;
  font-size: 12px;
  
  .avatar-status {
    border-width: 1px;
  }
}

.avatar-md {
  width: 48px;
  height: 48px;
  font-size: 16px;
}

.avatar-lg {
  width: 64px;
  height: 64px;
  font-size: 20px;
}

.avatar-xl {
  width: 96px;
  height: 96px;
  font-size: 32px;
}
</style>