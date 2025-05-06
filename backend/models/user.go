package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents a user in the social media system
type User struct {
	ID        string         `json:"id" gorm:"primaryKey;type:varchar(36)"`
	Email     string         `json:"email" gorm:"type:varchar(255);uniqueIndex;not null"`
	Name      string         `json:"username" gorm:"type:varchar(255);uniqueIndex;not null"`
	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
	Posts     []Post         `json:"posts,omitempty" gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

// TableName specifies the table name for User
func (User) TableName() string {
	return "users"
}

// TokenDetails contains the JWT token details
type TokenDetails struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token,omitempty"`
	TokenType    string    `json:"token_type"`
	ExpiresIn    int64     `json:"expires_in"`
	ExpiresAt    time.Time `json:"-"`
}
