import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useUserStore } from "./user";
import axios from "axios";

export interface Post {
  post_id: string;
  content: string;
  media?: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  created_at: Date;
  updated_at?: Date;
  group_id?: string;
  visibility: "public" | "private" | "group";
  likes_count: number;
  comments_count: number;
  user_likes?: string[];
}

export const usePostsStore = defineStore("posts", () => {
  const posts = ref<Post[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const userStore = useUserStore();

  const publicPosts = computed(() =>
    posts.value.filter((post) => post.visibility === "public")
  );

  const userPosts = computed(() =>
    posts.value.filter((post) => post.author_id === userStore.user?.uid)
  );

  // Actions
  async function fetchPosts() {
    if (!userStore.isAuthenticated || !userStore.accessToken) {
      error.value = "Authentication required to fetch posts";
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts`,
        {
          headers: { Authorization: `Bearer ${userStore.accessToken}` },
        }
      );

      if (response.data.posts && Array.isArray(response.data.posts)) {
        const fetchedPosts = response.data.posts.map((post: any) => ({
          ...post,
          created_at: new Date(post.created_at),
          updated_at: post.updated_at ? new Date(post.updated_at) : undefined,
        }));
        posts.value = fetchedPosts;
      }
    } catch (err: any) {
      console.error("Error fetching posts:", err);
      error.value =
        err.response?.data?.error || err.message || "Failed to fetch posts";
    } finally {
      loading.value = false;
    }
  }

  async function fetchPostById(postId: string) {
    if (!userStore.isAuthenticated || !userStore.accessToken) {
      error.value = "Authentication required to fetch post";
      return null;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts/${postId}`,
        {
          headers: { Authorization: `Bearer ${userStore.accessToken}` },
        }
      );

      if (response.data.post) {
        const post: Post = {
          ...response.data.post,
          created_at: new Date(response.data.post.created_at),
          updated_at: response.data.post.updated_at
            ? new Date(response.data.post.updated_at)
            : undefined,
        };
        return post;
      }
      return null;
    } catch (err: any) {
      console.error("Error fetching post:", err);
      error.value =
        err.response?.data?.error || err.message || "Failed to fetch post";
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function createPost(
    content: string,
    visibility: "public" | "private" | "group",
    groupId?: string,
    media?: string
  ) {
    if (!userStore.user || !userStore.accessToken) {
      error.value = "You must be logged in to create a post";
      return null;
    }

    loading.value = true;
    error.value = null;

    try {
      const postData = {
        content,
        media: media || null,
        visibility,
        group_id: visibility === "group" ? groupId : null,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts`,
        postData,
        {
          headers: { Authorization: `Bearer ${userStore.accessToken}` },
        }
      );

      if (response.data.post) {
        const newPost: Post = {
          ...response.data.post,
          created_at: new Date(response.data.post.created_at),
          updated_at: response.data.post.updated_at
            ? new Date(response.data.post.updated_at)
            : undefined,
        };
        posts.value.unshift(newPost);
        return newPost;
      }
      return null;
    } catch (err: any) {
      console.error("Error creating post:", err);
      error.value =
        err.response?.data?.error || err.message || "Failed to create post";
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updatePost(
    postId: string,
    content: string,
    visibility: "public" | "private" | "group",
    groupId?: string,
    media?: string
  ) {
    if (!userStore.user || !userStore.accessToken) {
      error.value = "You must be logged in to update a post";
      return false;
    }

    loading.value = true;
    error.value = null;

    try {
      const postData = {
        content,
        media: media || null,
        visibility,
        group_id: visibility === "group" ? groupId : null,
      };

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/posts/${postId}`,
        postData,
        {
          headers: { Authorization: `Bearer ${userStore.accessToken}` },
        }
      );

      if (response.data.post) {
        const updatedPost: Post = {
          ...response.data.post,
          created_at: new Date(response.data.post.created_at),
          updated_at: response.data.post.updated_at
            ? new Date(response.data.post.updated_at)
            : undefined,
        };
        const index = posts.value.findIndex((p) => p.post_id === postId);
        if (index !== -1) {
          posts.value[index] = updatedPost;
        }
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Error updating post:", err);
      error.value =
        err.response?.data?.error || err.message || "Failed to update post";
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function deletePost(postId: string) {
    if (!userStore.user || !userStore.accessToken) {
      error.value = "You must be logged in to delete a post";
      return false;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/posts/${postId}`,
        {
          headers: { Authorization: `Bearer ${userStore.accessToken}` },
        }
      );

      if (response.status === 200) {
        posts.value = posts.value.filter((p) => p.post_id !== postId);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Error deleting post:", err);
      error.value =
        err.response?.data?.error || err.message || "Failed to delete post";
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    posts,
    loading,
    error,
    publicPosts,
    userPosts,
    fetchPosts,
    fetchPostById,
    createPost,
    updatePost,
    deletePost,
  };
});
