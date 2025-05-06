<template>
  <div class="app-container">
    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const route = useRoute()

const showUserMenu = ref(false)
const showHeader = computed(() => !['login', 'register'].includes(route.name as string))
const isAuthenticated = computed(() => userStore.isAuthenticated)

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function logout() {
  userStore.logout()
  showUserMenu.value = false
}

onMounted(() => {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    if (!target.closest('.user-menu')) {
      showUserMenu.value = false
    }
  })
})

watch(() => route.path, () => {
  showUserMenu.value = false
})
</script>

<style>
:root {
  --primary-color: #6c5ce7;
  --primary-light: #a29bfe;
  --secondary-color: #00cec9;
  --text-color: #2d3436;
  --text-light: #636e72;
  --background-color: #f9f9f9;
  --card-color: #ffffff;
  --border-color: #dfe6e9;
  --danger-color: #ff7675;
  --success-color: #55efc4;
  --font-family: 'Nunito', sans-serif;
  --border-radius: 12px;
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.6;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background-color: var(--card-color);
  box-shadow: var(--shadow);
  position: sticky;
  top: 0;
  z-index: 100;
}

.main-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.logo a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--primary-color);
  font-weight: 700;
  font-size: 1.5rem;
}

.logo a .mdi {
  font-size: 1.8rem;
  margin-right: 0.5rem;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--text-color);
  font-weight: 600;
  transition: color 0.2s;
}

.nav-link .mdi {
  font-size: 1.3rem;
  margin-right: 0.5rem;
}

.nav-link:hover, 
.nav-link.router-link-active {
  color: var(--primary-color);
}

.auth-actions {
  display: flex;
  align-items: center;
}

.user-menu {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  padding: 0.5rem;
  border-radius: var(--border-radius);
}

.user-menu:hover {
  background-color: var(--background-color);
}

.user-menu .avatar, 
.user-menu .avatar-placeholder {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  margin-right: 0.5rem;
  object-fit: cover;
}

.user-menu .avatar-placeholder {
  font-size: 2rem;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-menu .username {
  margin-right: 0.5rem;
  font-weight: 600;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  width: 200px;
  z-index: 10;
  overflow: hidden;
  margin-top: 0.5rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  text-decoration: none;
  color: var(--text-color);
  transition: background-color 0.2s;
  cursor: pointer;
}

.dropdown-item .mdi {
  margin-right: 0.8rem;
  font-size: 1.2rem;
}

.dropdown-item:hover {
  background-color: var(--background-color);
  color: var(--primary-color);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.2rem;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  border: none;
}

.btn .mdi {
  margin-right: 0.5rem;
}

.btn-login {
  background-color: var(--primary-color);
  color: white;
}

.btn-login:hover {
  background-color: var(--primary-light);
}

main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
