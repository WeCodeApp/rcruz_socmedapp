<template>
  <Card class="post-form" :flat="!isEditing">
    <template #header v-if="isEditing">
      <div class="form-header">
        <h3>{{ isEditing ? "Edit Post" : "Create Post" }}</h3>
      </div>
    </template>

    <div class="form-content">
      <div class="form-user" v-if="!isEditing">
        <Avatar
          :src="userStore.user?.photoURL ?? undefined"
          :name="userStore.user?.displayName ?? undefined"
          size="md"
        />
      </div>

      <div class="form-group">
        <textarea
          v-model="content"
          class="form-textarea"
          :placeholder="
            isEditing ? 'Edit your post...' : 'What\'s on your mind?'
          "
          rows="3"
          @input="autoResize"
          ref="textareaRef"
        ></textarea>
      </div>

      <div v-if="imagePreview" class="image-preview-container">
        <img :src="imagePreview" alt="Preview" class="image-preview" />
        <button class="remove-image" @click="removeImage">
          <span class="mdi mdi-close"></span>
        </button>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>

    <template #footer>
      <div class="form-footer">
        <div class="form-actions">
          <button class="action-button" @click="triggerImageUpload">
            <span class="mdi mdi-image"></span>
            <span class="action-text">Photo</span>
          </button>
          <input
            type="file"
            ref="fileInput"
            style="display: none"
            accept="image/*"
            @change="handleImageUpload"
          />
        </div>
        <div class="form-submit">
          <Button
            :disabled="!isValid || loading"
            :loading="loading"
            @click="submitPost"
          >
            {{ isEditing ? "Save Changes" : "Post" }}
          </Button>
          <Button
            v-if="isEditing"
            variant="outline"
            @click="$emit('cancel')"
            :disabled="loading"
          >
            Cancel
          </Button>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import Card from "@/components/common/Card.vue";
import Avatar from "@/components/common/Avatar.vue";
import Button from "@/components/common/Button.vue";
import { useUserStore } from "@/stores/user";
import { usePostsStore, type Post } from "@/stores/posts";

const props = defineProps({
  post: {
    type: Object as () => Post | null,
    default: null,
  },
  groupId: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["created", "updated", "cancel"]);

const userStore = useUserStore();
const postsStore = usePostsStore();

const content = ref("");
const privacy = ref<"public" | "private" | "group">(
  props.groupId ? "group" : "public"
);
const imageFile = ref<File | null>(null);
const imagePreview = ref("");
const loading = ref(false);
const error = ref("");
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const isEditing = computed(() => !!props.post);
const isValid = computed(() => content.value.trim().length > 0);

watch(
  () => props.post,
  (newPost) => {
    if (newPost) {
      content.value = newPost.content;
      privacy.value = newPost.visibility;
      imagePreview.value = newPost.media || "";
    }
  },
  { immediate: true }
);

function autoResize() {
  if (!textareaRef.value) return;

  textareaRef.value.style.height = "auto";

  textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`;
}

function triggerImageUpload() {
  if (fileInput.value) {
    fileInput.value.click();
  }
}

function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];

  if (!file.type.startsWith("image/")) {
    error.value = "Please select an image file";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    error.value = "Image size should be less than 5MB";
    return;
  }

  imageFile.value = file;
  imagePreview.value = URL.createObjectURL(file);
  error.value = "";
}

function removeImage() {
  imageFile.value = null;
  imagePreview.value = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

async function submitPost() {
  if (!isValid.value || !userStore.user) return;

  loading.value = true;
  error.value = "";

  try {
    // In a real app, you would upload the image to storage and get the URL

    if (isEditing.value && props.post) {
      // Update existing post
      const success = await postsStore.updatePost(
        props.post.post_id,
        content.value,
        privacy.value,
        props.groupId,
        imagePreview.value || undefined
      );

      if (success) {
        emit("updated", {
          ...props.post,
          content: content.value,
          visibility: privacy.value,
          media: imagePreview.value || undefined,
          group_id: privacy.value === "group" ? props.groupId : undefined,
        });
        resetForm();
      }
    } else {
      // Create new post
      const newPost = await postsStore.createPost(
        content.value,
        privacy.value,
        props.groupId,
        imagePreview.value || undefined
      );

      if (newPost) {
        emit("created", newPost);
        resetForm();
      }
    }
  } catch (err: any) {
    console.error("Error submitting post:", err);
    error.value = err.message || "Failed to submit post";
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  if (!isEditing.value) {
    content.value = "";
    privacy.value = props.groupId ? "group" : "public";
    removeImage();
  }
}

// Set initial height for textarea
onMounted(() => {
  autoResize();
});
</script>

<style lang="scss" scoped>
.post-form {
  margin-bottom: 2rem;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
  }
}

.form-content {
  margin-bottom: 1rem;
}

.form-user {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.user-info {
  margin-left: 0.75rem;
}

.user-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.privacy-selector {
  font-size: 0.85rem;
}

.privacy-select {
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
}

.form-textarea {
  width: 100%;
  border: none;
  resize: none;
  font-family: var(--font-family);
  font-size: 1rem;
  padding: 0.5rem 0;
  background-color: transparent;

  &:focus {
    outline: none;
  }
}

.image-preview-container {
  position: relative;
  margin-top: 1rem;
  border-radius: var(--border-radius);
  overflow: hidden;
  max-height: 300px;
}

.image-preview {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.remove-image {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }

  .mdi {
    font-size: 1.25rem;
  }
}

.error-message {
  color: var(--danger-color);
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}

.form-actions {
  display: flex;
}

.action-button {
  display: flex;
  align-items: center;
  background-color: transparent;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--background-color);
  }

  .mdi {
    font-size: 1.25rem;
    margin-right: 0.5rem;
    color: var(--primary-color);
  }

  .action-text {
    font-weight: 500;
  }
}

.form-submit {
  display: flex;
  gap: 0.5rem;
}
</style>
