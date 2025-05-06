package migrations

import (
	"go-azure/models"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// Migrate runs database migrations
func Migrate(db *gorm.DB) error {
	logrus.Info("Running database migrations")

	// Auto migrate models
	err := db.AutoMigrate(
		&models.User{},
		&models.Post{},
	)
	if err != nil {
		logrus.WithError(err).Error("Failed to run migrations")
		return err
	}

	logrus.Info("Database migrations completed successfully")
	return nil
}
