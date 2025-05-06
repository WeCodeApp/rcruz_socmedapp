package models

import (
	"time"

	"gorm.io/gorm"
)

// Post represents a social media post in the system
type Post struct {
	ID        string         `json:"id" gorm:"primaryKey;type:varchar(36)"`
	Content   string         `json:"content" binding:"required" gorm:"type:text;not null"`
	Caption   string         `json:"caption" gorm:"type:varchar(255)"`
	IsPublic  bool           `json:"is_public" gorm:"default:true"`
	UserID    string         `json:"user_id" gorm:"type:varchar(36);index;not null"`
	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName specifies the table name for Post
func (Post) TableName() string {
	return "posts"
}
