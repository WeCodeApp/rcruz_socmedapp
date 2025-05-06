package controllers

import (
	"net/http"

	"go-azure/middleware"
	"go-azure/models"
	"go-azure/services"
	"go-azure/utils"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// PostController handles social media post endpoints
type PostController struct {
	postService    *services.PostService
	authMiddleware *middleware.AuthMiddleware
	logger         *logrus.Logger
}

// NewPostController creates a new PostController
func NewPostController(postService *services.PostService, authMiddleware *middleware.AuthMiddleware) *PostController {
	return &PostController{
		postService:    postService,
		authMiddleware: authMiddleware,
		logger:         utils.GetLogger(),
	}
}

// RegisterRoutes registers the routes for the PostController
func (c *PostController) RegisterRoutes(router *gin.Engine) {
	posts := router.Group("/posts")
	posts.Use(c.authMiddleware.RequireAuth())
	{
		posts.GET("", c.GetAllPosts)
		posts.GET("/:id", c.GetPostByID)
		posts.POST("", c.CreatePost)
		posts.PUT("/:id", c.UpdatePost)
		posts.DELETE("/:id", c.DeletePost)
	}
}

// GetAllPosts returns all posts for the authenticated user
func (c *PostController) GetAllPosts(ctx *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID := ctx.GetString("user_id")

	// Get posts
	posts := c.postService.GetAllPosts(userID)

	ctx.JSON(http.StatusOK, gin.H{"posts": posts})
}

// GetPostByID returns a post by ID
func (c *PostController) GetPostByID(ctx *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID := ctx.GetString("user_id")

	// Get post ID from URL
	postID := ctx.Param("id")

	// Get post
	post, err := c.postService.GetPostByID(postID, userID)
	if err != nil {
		c.logger.WithError(err).Error("Failed to get post")
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"post": post})
}

// CreatePost creates a new post
func (c *PostController) CreatePost(ctx *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID := ctx.GetString("user_id")

	// Parse request body
	var post models.Post
	if err := ctx.ShouldBindJSON(&post); err != nil {
		c.logger.WithError(err).Error("Failed to parse request body")
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create post
	createdPost, err := c.postService.CreatePost(&post, userID)
	if err != nil {
		c.logger.WithError(err).Error("Failed to create post")
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"post": createdPost})
}

// UpdatePost updates an existing post
func (c *PostController) UpdatePost(ctx *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID := ctx.GetString("user_id")

	// Get post ID from URL
	postID := ctx.Param("id")

	// Parse request body
	var post models.Post
	if err := ctx.ShouldBindJSON(&post); err != nil {
		c.logger.WithError(err).Error("Failed to parse request body")
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update post
	updatedPost, err := c.postService.UpdatePost(postID, &post, userID)
	if err != nil {
		c.logger.WithError(err).Error("Failed to update post")
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"post": updatedPost})
}

// DeletePost deletes a post
func (c *PostController) DeletePost(ctx *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID := ctx.GetString("user_id")

	// Get post ID from URL
	postID := ctx.Param("id")

	// Delete post
	err := c.postService.DeletePost(postID, userID)
	if err != nil {
		c.logger.WithError(err).Error("Failed to delete post")
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
}
