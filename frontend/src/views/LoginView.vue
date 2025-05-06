<template>
  <div class="login-view">
    <div class="container">
      <div class="login-box">
        <h1 class="title">Generic Social Media Application</h1>

        <div v-if="error" class="error">
          <p>{{ error }}</p>
        </div>

        <button
          class="btn microsoft-btn"
          :disabled="loading === 'microsoft'"
          @click="loginWithMicrosoft"
        >
          <span v-if="loading === 'microsoft'" class="spinner"></span>
          <span class="mdi mdi-microsoft"></span>
          Login with Microsoft
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// State
const loading = ref<"microsoft" | null>(null);
const error = ref("");

// Methods
async function loginWithMicrosoft() {
  loading.value = "microsoft";
  error.value = "";
  try {
    const user = await userStore.loginWithMicrosoft();
    if (user) {
      handleSuccessfulLogin();
    }
  } catch (err: any) {
    error.value = err.message || "Failed to login with Microsoft.";
  } finally {
    loading.value = null;
  }
}

function handleSuccessfulLogin() {
  const redirectPath = (route.query.redirect as string) || "/";
  router.push(redirectPath);
}

function handleAuthCallback() {
  const queryUser = route.query.user as string;
  const queryToken = route.query.token as string;

  if (queryUser && queryToken) {
    try {
      const user = JSON.parse(queryUser);
      const token = JSON.parse(queryToken);
      userStore.handleAuthCallback(user, token);
      handleSuccessfulLogin();
      return true;
    } catch (error) {
      console.error("Failed to parse query parameters:", error);
    }
  }
  return false;
}

onMounted(() => {
  if (!handleAuthCallback() && userStore.isAuthenticated) {
    handleSuccessfulLogin();
  }
});
</script>

<style lang="scss" scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(to bottom right, #7a176c, #0085fa);
}

.container {
  max-width: 400px;
  width: 100%;
}

.login-box {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.title {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.error {
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.microsoft-btn {
  background: #007bff;
  color: white;
  &:hover {
    background: #0056b3;
  }
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

.mdi {
  font-size: 1.2rem;
  margin-right: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
