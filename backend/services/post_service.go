package services

import (
	"errors"

	"go-azure/models"
	"go-azure/utils"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// PostService handles social media post operations
type PostService struct {
	db     *gorm.DB
	logger *logrus.Logger
}

// NewPostService creates a new PostService
func NewPostService() *PostService {
	return &PostService{
		db:     utils.GetDB(),
		logger: utils.GetLogger(),
	}
}

// GetAllPosts returns all posts for a user
func (s *PostService) GetAllPosts(userID string) []*models.Post {
	var posts []*models.Post

	result := s.db.Where("user_id = ?", userID).Find(&posts)
	if result.Error != nil {
		s.logger.WithError(result.Error).Error("Failed to get posts")
		return []*models.Post{}
	}

	return posts
}

// GetPostByID returns a post by ID
func (s *PostService) GetPostByID(postID string, userID string) (*models.Post, error) {
	var post models.Post

	result := s.db.Where("id = ? AND user_id = ?", postID, userID).First(&post)
	if result.Error != nil {
		s.logger.WithError(result.Error).Error("Failed to get post")
		return nil, errors.New("post not found")
	}

	return &post, nil
}

// CreatePost creates a new post
func (s *PostService) CreatePost(post *models.Post, userID string) (*models.Post, error) {
	// Set post ID and user ID
	post.ID = uuid.New().String()
	post.UserID = userID

	// Create post in database
	result := s.db.Create(post)
	if result.Error != nil {
		s.logger.WithError(result.Error).Error("Failed to create post")
		return nil, errors.New("failed to create post")
	}

	s.logger.WithFields(logrus.Fields{
		"post_id": post.ID,
		"user_id": userID,
	}).Info("Post created")

	return post, nil
}

// UpdatePost updates an existing post
func (s *PostService) UpdatePost(postID string, updatedPost *models.Post, userID string) (*models.Post, error) {
	// Get existing post
	var existingPost models.Post
	result := s.db.Where("id = ? AND user_id = ?", postID, userID).First(&existingPost)
	if result.Error != nil {
		s.logger.WithError(result.Error).Error("Failed to get post for update")
		return nil, errors.New("post not found")
	}

	// Update post fields
	existingPost.Caption = updatedPost.Caption
	existingPost.Content = updatedPost.Content
	existingPost.IsPublic = updatedPost.IsPublic

	// Save changes to database
	result = s.db.Save(&existingPost)
	if result.Error != nil {
		s.logger.WithError(result.Error).Error("Failed to update post")
		return nil, errors.New("failed to update post")
	}

	s.logger.WithFields(logrus.Fields{
		"post_id": postID,
		"user_id": userID,
	}).Info("Post updated")

	return &existingPost, nil
}

// DeletePost deletes a post
func (s *PostService) DeletePost(postID string, userID string) error {
	// Check if post exists and belongs to user
	var post models.Post
	result := s.db.Where("id = ? AND user_id = ?", postID, userID).First(&post)
	if result.Error != nil {
		s.logger.WithError(result.Error).Error("Failed to get post for deletion")
		return errors.New("post not found")
	}

	// Delete post
	result = s.db.Delete(&post)
	if result.Error != nil {
		s.logger.WithError(result.Error).Error("Failed to delete post")
		return errors.New("failed to delete post")
	}

	s.logger.WithFields(logrus.Fields{
		"post_id": postID,
		"user_id": userID,
	}).Info("Post deleted")

	return nil
}
