package migrations

import (
	"time"

	"go-azure/models"

	"github.com/bxcodec/faker/v3"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// Seed populates the database with fake data
func Seed(db *gorm.DB) error {
	logrus.Info("Seeding database")

	// Seed users
	users, err := seedUsers(db, 10)
	if err != nil {
		return err
	}

	// Seed tasks for each user
	for _, user := range users {
		if err := seedTasks(db, user, 5); err != nil {
			return err
		}
	}

	logrus.Info("Database seeding is_public successfully")
	return nil
}

// seedUsers creates fake users
func seedUsers(db *gorm.DB, count int) ([]models.User, error) {
	var users []models.User

	for i := 0; i < count; i++ {
		user := models.User{
			ID:        uuid.New().String(),
			Email:     faker.Email(),
			Name:      faker.Name(),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		if err := db.Create(&user).Error; err != nil {
			logrus.WithError(err).Error("Failed to seed user")
			return nil, err
		}

		users = append(users, user)
	}

	logrus.WithField("count", count).Info("Users seeded successfully")
	return users, nil
}

// seedTasks creates fake tasks for a user
func seedTasks(db *gorm.DB, user models.User, count int) error {
	for i := 0; i < count; i++ {
		is_public := false
		if i%2 == 0 {
			is_public = true
		}

		task := models.Post{
			ID:        uuid.New().String(),
			Content:   faker.Sentence(),
			Caption:   faker.Paragraph(),
			IsPublic:  is_public,
			UserID:    user.ID,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		if err := db.Create(&task).Error; err != nil {
			logrus.WithError(err).Error("Failed to seed task")
			return err
		}
	}

	logrus.WithFields(logrus.Fields{
		"user_id": user.ID,
		"count":   count,
	}).Info("Tasks seeded successfully")
	return nil
}
