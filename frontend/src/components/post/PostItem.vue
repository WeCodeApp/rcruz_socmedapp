<template>
  <Card class="post-item" hover>
    <template #header>
      <div class="post-header">
        <div class="post-author">
          <Avatar 
            :src="post.author_avatar || ''" 
            :name="post.author_name" 
            size="md" 
            clickable
            @click="navigateToProfile"
          />
          <div class="post-meta">
            <div class="post-author-name">{{ post.author_name }}</div>
            <div class="post-time">{{ formattedDate }}</div>
          </div>
        </div>
        <div class="post-actions">
          <div v-if="isAuthor" class="post-menu">
            <button class="btn-icon" @click="toggleMenu">
              <span class="mdi mdi-dots-vertical"></span>
            </button>
            <div v-if="showMenu" class="dropdown-menu">
              <button class="dropdown-item" @click="editPost">
                <span class="mdi mdi-pencil"></span>
                Edit
              </button>
              <button class="dropdown-item text-danger" @click="confirmDelete">
                <span class="mdi mdi-delete"></span>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div class="post-content">
      <p>{{ post.content }}</p>
      <img v-if="post.media" :src="post.media || ''" alt="Post image" class="post-image" />
    </div>

    <template #footer>
      <div class="post-footer">
        <div class="post-stats">
          <div class="post-likes">
            <span class="mdi mdi-heart"></span>
            {{ post.likes_count }}
          </div>
          <div class="post-comments">
            <span class="mdi mdi-comment-outline"></span>
            {{ post.comments_count }}
          </div>
        </div>
        <div class="post-actions">
          <Button 
            :variant="isLiked ? 'primary' : 'outline'" 
            size="sm" 
            icon="heart" 
            @click="toggleLike"
          >
            {{ isLiked ? 'Liked' : 'Like' }}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            icon="comment-outline" 
            @click="toggleComments"
          >
            Comment
          </Button>
        </div>
      </div>

      <div v-if="showComments" class="post-comments-section">
        <div v-if="loading" class="text-center p-3">
          <span class="mdi mdi-loading mdi-spin"></span> Loading comments...
        </div>

        <div v-else-if="comments.length === 0" class="text-center p-3">
          No comments yet. Be the first to comment!
        </div>

        <div v-else class="comments-list">
          <div v-for="comment in comments" :key="comment.comment_id" class="comment-item">
            <Avatar 
              :src="comment.author_avatar || ''" 
              :name="comment.author_name" 
              size="sm" 
            />
            <div class="comment-content">
              <div class="comment-author">{{ comment.author_name }}</div>
              <div class="comment-text">{{ comment.content }}</div>
              <div class="comment-time">{{ formatDate(comment.created_at) }}</div>
            </div>
          </div>
        </div>

        <div class="comment-form">
          <Avatar 
            :src="userStore.user?.photoURL ?? undefined" 
            :name="userStore.user?.displayName ?? undefined" 
            size="sm" 
          />
          <div class="comment-input-wrapper">
            <input 
              v-model="newComment" 
              type="text" 
              class="comment-input" 
              placeholder="Write a comment..." 
              @keyup.enter="addComment"
            />
            <button 
              class="btn-icon send-button" 
              :disabled="!newComment.trim()" 
              @click="addComment"
            >
              <span class="mdi mdi-send"></span>
            </button>
          </div>
        </div>
      </div>
    </template>
  </Card>

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
    <div class="modal-content" @click.stop>
      <h3>Delete Post</h3>
      <p>Are you sure you want to delete this post? This action cannot be undone.</p>
      <div class="modal-actions">
        <Button variant="outline" @click="showDeleteConfirm = false">Cancel</Button>
        <Button variant="danger" @click="deletePost">Delete</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { formatDistanceToNow } from 'date-fns'
import Card from '@/components/common/Card.vue'
import Avatar from '@/components/common/Avatar.vue'
import Button from '@/components/common/Button.vue'
import { useUserStore } from '@/stores/user'
import { usePostsStore, type Post, type Comment } from '@/stores/posts'

const props = defineProps<{
  post: Post
}>()

const emit = defineEmits(['edit', 'delete'])

const router = useRouter()
const userStore = useUserStore()
const postsStore = usePostsStore()

// State
const showMenu = ref(false)
const showComments = ref(false)
const showDeleteConfirm = ref(false)
const comments = ref<Comment[]>([])
const newComment = ref('')
const loading = ref(false)

// Computed
const isAuthor = computed(() => 
  userStore.user?.uid === props.post.author_id
)

const isLiked = computed(() => 
  userStore.user ? props.post.user_likes?.includes(userStore.user.uid) ?? false : false
)

const formattedDate = computed(() => 
  formatDate(props.post.created_at)
)

// Methods
function formatDate(date: Date) {
  return formatDistanceToNow(date, { addSuffix: true })
}

function toggleMenu() {
  showMenu.value = !showMenu.value
}

function toggleComments() {
  showComments.value = !showComments.value

  if (showComments.value && comments.value.length === 0) {
    fetchComments()
  }
}

async function fetchComments() {
  loading.value = true
  try {
    comments.value = await postsStore.fetchComments(props.post.post_id)
  } catch (error) {
    console.error('Error fetching comments:', error)
  } finally {
    loading.value = false
  }
}

async function addComment() {
  if (!newComment.value.trim() || !userStore.user) return

  try {
    const comment = await postsStore.addComment(props.post.post_id, newComment.value)
    if (comment) {
      newComment.value = ''
    }
  } catch (error) {
    console.error('Error adding comment:', error)
  }
}

async function toggleLike() {
  if (!userStore.user) {
    router.push('/login')
    return
  }

  try {
    if (isLiked.value) {
      await postsStore.unlikePost(props.post.post_id)
    } else {
      await postsStore.likePost(props.post.post_id)
    }
  } catch (error) {
    console.error('Error toggling like:', error)
  }
}

function editPost() {
  showMenu.value = false
  emit('edit', props.post)
}

function confirmDelete() {
  showMenu.value = false
  showDeleteConfirm.value = true
}

async function deletePost() {
  try {
    const success = await postsStore.deletePost(props.post.post_id)
    if (success) {
      showDeleteConfirm.value = false
      emit('delete', props.post.post_id)
    }
  } catch (error) {
    console.error('Error deleting post:', error)
  }
}

function navigateToProfile() {
  router.push(`/profile/${props.post.author_id}`)
}

// Close menu when clicking outside
onMounted(() => {
  document.addEventListener('click', () => {
    if (showMenu.value) {
      showMenu.value = false
    }
  })
})
</script>

<style lang="scss" scoped>
.post-item {
  margin-bottom: 1.5rem;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.post-author {
  display: flex;
  align-items: center;
}

.post-meta {
  margin-left: 0.75rem;
}

.post-author-name {
  font-weight: 600;
  color: var(--text-color);
}

.post-time {
  font-size: 0.85rem;
  color: var(--text-light);
}

.post-actions {
  display: flex;
  align-items: center;
}

.post-privacy {
  margin-right: 0.75rem;
  color: var(--text-light);

  .mdi {
    font-size: 1.25rem;
  }
}

.post-menu {
  position: relative;
}

.btn-icon {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  color: var(--text-light);
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .mdi {
    font-size: 1.25rem;
  }
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  min-width: 150px;
  z-index: 10;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .mdi {
    margin-right: 0.5rem;
    font-size: 1.1rem;
  }

  &.text-danger {
    color: var(--danger-color);
  }
}

.post-content {
  margin-bottom: 1rem;

  p {
    margin-bottom: 1rem;
    white-space: pre-line;
  }
}

.post-image {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: var(--border-radius);
  margin-top: 0.5rem;
}

.post-footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.post-stats {
  display: flex;
  align-items: center;
  color: var(--text-light);
  font-size: 0.9rem;

  .post-likes, .post-comments {
    display: flex;
    align-items: center;
    margin-right: 1rem;

    .mdi {
      margin-right: 0.25rem;
    }
  }

  .post-likes .mdi {
    color: var(--danger-color);
  }
}

.post-actions {
  display: flex;
  gap: 0.5rem;
}

.post-comments-section {
  margin-top: 1rem;
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}

.comments-list {
  margin-bottom: 1rem;
}

.comment-item {
  display: flex;
  margin-bottom: 1rem;
}

.comment-content {
  margin-left: 0.75rem;
  background-color: var(--background-color);
  padding: 0.75rem;
  border-radius: var(--border-radius);
  flex: 1;
}

.comment-author {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.comment-text {
  margin-bottom: 0.25rem;
}

.comment-time {
  font-size: 0.8rem;
  color: var(--text-light);
}

.comment-form {
  display: flex;
  align-items: center;
  margin-top: 1rem;
}

.comment-input-wrapper {
  margin-left: 0.75rem;
  flex: 1;
  position: relative;
}

.comment-input {
  width: 100%;
  padding: 0.75rem;
  padding-right: 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background-color: var(--background-color);
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
}

.send-button {
  position: absolute;
  right: 0.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--primary-color);

  &:disabled {
    color: var(--text-light);
    cursor: not-allowed;
  }
}

// Modal styles
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background-color: var(--card-color);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;

  h3 {
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 1.5rem;
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
