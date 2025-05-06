<template>
  <div class="post-view">
    <div class="container">
      <!-- Create Post Form -->
      <PostForm 
        v-if="isAuthenticated" 
        @created="handlePostCreated" 
        class="post-form"
      />

      <!-- Posts List -->
      <div v-if="loading" class="loading">
        <span class="spinner"></span>
        <p>Loading posts...</p>
      </div>
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
      </div>
      <div v-else-if="displayedPosts.length === 0" class="empty">
        <span class="mdi mdi-emoticon-sad-outline"></span>
        <h3>No posts yet</h3>
        <p>Be the first to share something!</p>
        <button v-if="isAuthenticated" @click="scrollToPostForm" class="btn">Create Post</button>
        <button v-else @click="$router.push('/login')" class="btn">Login to Post</button>
      </div>
      <div v-else class="posts">
        <PostItem 
          v-for="post in displayedPosts" 
          :key="post.post_id"
          :post="post"
          @edit="handleEditPost"
          @delete="handleDeletePost"
        />
      </div>

      <!-- Load More -->
      <button 
        v-if="!loading && displayedPosts.length > 0 && hasMorePosts" 
        class="load-more btn" 
        :disabled="loadingMore"
        @click="loadMorePosts"
      >
        {{ loadingMore ? 'Loading...' : 'Load More' }}
      </button>

      <!-- Edit Post Modal -->
      <div v-if="editingPost" class="modal" @click="cancelEdit">
        <div class="modal-content" @click.stop>
          <h3>Edit Post</h3>
          <PostForm 
            :post="editingPost" 
            @updated="handlePostUpdated" 
            @cancel="cancelEdit" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PostItem from '@/components/post/PostItem.vue'
import PostForm from '@/components/post/PostForm.vue'
import { useUserStore } from '@/stores/user'
import { usePostsStore, type Post } from '@/stores/posts'

const userStore = useUserStore()
const postsStore = usePostsStore()

// State
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const editingPost = ref<Post | null>(null)

// Computed
const isAuthenticated = computed(() => userStore.isAuthenticated)
const displayedPosts = computed(() => postsStore.publicPosts)
const hasMorePosts = computed(() => postsStore.posts.length >= 10)

// Methods
async function fetchInitialData() {
  loading.value = true
  error.value = ''
  try {
    await postsStore.fetchPosts()
  } catch (err: any) {
    error.value = 'Failed to load posts.'
  } finally {
    loading.value = false
  }
}

async function loadMorePosts() {
  loadingMore.value = true
  try {
    // Simulate pagination by fetching more posts
    await postsStore.fetchPosts() // In a real app, this would include pagination parameters
  } catch (err: any) {
    error.value = 'Failed to load more posts.'
  } finally {
    loadingMore.value = false
  }
}

function handlePostCreated(post: Post) {
  // Post is already added to store via createPost
  scrollToPostForm()
}

function handleEditPost(post: Post) {
  editingPost.value = post
}

function handlePostUpdated(post: Post) {
  editingPost.value = null
}

async function handleDeletePost(postId: string) {
  try {
    await postsStore.deletePost(postId)
  } catch (err: any) {
    error.value = 'Failed to delete post.'
  }
}

function cancelEdit() {
  editingPost.value = null
}

function scrollToPostForm() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(fetchInitialData)
</script>

<style lang="scss" scoped>
.post-view {
  padding: 2rem 0;
  background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
  min-height: 100vh;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.post-form {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.posts {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.loading, .error, .empty {
  text-align: center;
  padding: 2.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 5px solid #007bff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty {
  .mdi {
    font-size: 3.5rem;
    color: #6c757d;
    margin-bottom: 1rem;
  }
  h3 {
    font-size: 1.8rem;
    margin-bottom: 0.75rem;
    color: #333;
  }
  p {
    color: #6c757d;
    margin-bottom: 1.5rem;
  }
}

.error {
  p {
    color: #dc3545;
    font-size: 1rem;
  }
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  &:hover {
    background: #0056b3;
    transform: translateY(-2px);
  }
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
  }
}

.load-more {
  display: block;
  margin: 2rem auto;
  padding: 0.75rem 3rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  h3 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: #333;
  }
}
</style>