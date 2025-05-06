<template>
  <div class="not-found-view">
    <div class="container">
      <Card class="not-found-card">
        <div class="not-found-content">
          <div class="not-found-icon">
            <span class="mdi mdi-map-marker-question"></span>
          </div>
          <h1 class="not-found-title">404</h1>
          <h2 class="not-found-subtitle">Page Not Found</h2>
          <p class="not-found-message">
            Page not found. The page you are looking for might have been
            removed, had its name changed, or is temporarily unavailable.
          </p>
          <div class="not-found-actions">
            <Button @click="goBack">
              <span class="mdi mdi-arrow-left"></span>
              Go Back
            </Button>
            <Button variant="outline" @click="goHome">
              <span class="mdi mdi-home"></span>
              Go Home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import Card from "@/components/common/Card.vue";
import Button from "@/components/common/Button.vue";

const router = useRouter();

function goBack() {
  router.back();
}

function goHome() {
  router.push("/");
}
</script>

<style lang="scss" scoped>
.not-found-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.not-found-card {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
}

.not-found-content {
  padding: 2rem;
}

.not-found-icon {
  font-size: 5rem;
  color: var(--primary-color);
  margin-bottom: 1rem;

  .mdi {
    animation: bounce 2s infinite;
  }
}

.not-found-title {
  font-size: 4rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
  line-height: 1;
}

.not-found-subtitle {
  font-size: 1.5rem;
  margin: 0.5rem 0 1.5rem;
  color: var(--text-color);
}

.not-found-message {
  color: var(--text-light);
  margin-bottom: 2rem;
}

.not-found-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: center;
  }
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}
</style>
