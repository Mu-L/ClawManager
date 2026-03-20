package utils

import (
	"errors"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// Success sends a successful response
func Success(c *gin.Context, status int, message string, data interface{}) {
	c.JSON(status, gin.H{
		"success": true,
		"message": message,
		"data":    data,
	})
}

// Error sends an error response
func Error(c *gin.Context, status int, message string) {
	c.JSON(status, gin.H{
		"success": false,
		"error":   message,
	})
}

// HandleError handles different types of errors and sends appropriate responses
func HandleError(c *gin.Context, err error) {
	// Log the actual error for debugging
	log.Printf("[ERROR] %v", err)

	// Handle validation errors
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		Error(c, http.StatusBadRequest, formatValidationErrors(validationErrors))
		return
	}

	// Handle known errors
	errStr := err.Error()
	switch errStr {
	case "username already exists", "email already exists", "instance name already exists":
		Error(c, http.StatusConflict, errStr)
	case "unsupported instance type", "image is required":
		Error(c, http.StatusBadRequest, errStr)
	case "invalid username or password", "account is disabled":
		Error(c, http.StatusUnauthorized, errStr)
	case "current password is incorrect":
		Error(c, http.StatusBadRequest, errStr)
	case "user not found":
		Error(c, http.StatusNotFound, errStr)
	default:
		// For development, show actual error; for production, hide details
		Error(c, http.StatusInternalServerError, errStr)
	}
}

// ValidationError handles validation errors from gin binding
func ValidationError(c *gin.Context, err error) {
	var ve validator.ValidationErrors
	if errors.As(err, &ve) {
		Error(c, http.StatusBadRequest, formatValidationErrors(ve))
		return
	}
	Error(c, http.StatusBadRequest, err.Error())
}

func formatValidationErrors(errs validator.ValidationErrors) string {
	var messages []string
	for _, err := range errs {
		switch err.Tag() {
		case "required":
			messages = append(messages, err.Field()+" is required")
		case "min":
			messages = append(messages, err.Field()+" must be at least "+err.Param()+" characters")
		case "max":
			messages = append(messages, err.Field()+" must be at most "+err.Param()+" characters")
		case "email":
			messages = append(messages, err.Field()+" must be a valid email")
		case "alphanum":
			messages = append(messages, err.Field()+" must be alphanumeric")
		default:
			messages = append(messages, err.Field()+" is invalid")
		}
	}
	return messages[0]
}
