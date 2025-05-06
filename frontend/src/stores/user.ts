import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export const useUserStore = defineStore(
  "user",
  () => {
    // State
    const user = ref<User | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const accessToken = ref<string | null>(null);

    const isAuthenticated = computed(() => !!user.value);

    async function loginWithGoogle() {
      loading.value = true;
      error.value = null;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/google`
        );

        if (response.data && response.data.user) {
          user.value = response.data.user;
          accessToken.value = response.data.token;
          return user.value;
        } else {
          throw new Error("Invalid response from authentication server");
        }
      } catch (err: any) {
        error.value = err.message || "Failed to login with Google";
        console.error("Google login error:", err);
        return null;
      } finally {
        loading.value = false;
      }
    }

    async function loginWithMicrosoft() {
      loading.value = true;
      error.value = null;

      try {
        // Use backend authentication endpoint
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/microsoft`
        );

        // Process the response and set user data
        if (response.data && response.data.login_url) {
          window.location.href = response.data.login_url;
        } else {
          throw new Error("Invalid response from authentication server");
        }
      } catch (err: any) {
        error.value = err.message || "Failed to login with Microsoft";
        console.error("Microsoft login error:", err);
        return null;
      } finally {
        loading.value = false;
      }
    }

    async function logout() {
      loading.value = true;
      error.value = null;

      try {
        user.value = null;
        accessToken.value = null;
      } catch (err: any) {
        error.value = err.message || "Failed to logout";
        console.error("Logout error:", err);
      } finally {
        loading.value = false;
      }
    }

    async function refreshToken() {
      if (!user.value) return null;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh-token`
        );

        if (response.data && response.data.token) {
          accessToken.value = response.data.token;
          return accessToken.value;
        }
        return null;
      } catch (err) {
        console.error("Error refreshing token:", err);
        return null;
      }
    }

    function handleAuthCallback(
      parsedUser: {
        user_id: string;
        email: string;
        name: string;
        avatar: string;
      },
      parsedToken: { user_id: string; access_token: string }
    ) {
      user.value = {
        uid: parsedUser.user_id,
        email: parsedUser.email,
        displayName: parsedUser.name,
        photoURL: parsedUser.avatar,
      };

      accessToken.value = parsedToken.access_token;

      return user.value;
    }

    return {
      user,
      loading,
      error,
      accessToken,
      isAuthenticated,
      loginWithGoogle,
      loginWithMicrosoft,
      logout,
      refreshToken,
      handleAuthCallback,
    };
  },
  {
    persist: {
      key: "user-store",
      storage: localStorage,
      paths: ["user", "accessToken"],
    },
  }
);
