package services

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"sync"
	"time"
)

// AccessToken represents a temporary access token for instance
type AccessToken struct {
	Token      string    `json:"token"`
	InstanceID int       `json:"instance_id"`
	UserID     int       `json:"user_id"`
	InstanceType string  `json:"instance_type"`
	TargetPort int32     `json:"target_port"`
	AccessURL  string    `json:"access_url"`
	ExpiresAt  time.Time `json:"expires_at"`
	CreatedAt  time.Time `json:"created_at"`
}

// InstanceAccessService manages instance access tokens
type InstanceAccessService struct {
	tokens map[string]*AccessToken
	mu     sync.RWMutex
}

// NewInstanceAccessService creates a new instance access service
func NewInstanceAccessService() *InstanceAccessService {
	service := &InstanceAccessService{
		tokens: make(map[string]*AccessToken),
	}

	// Start cleanup goroutine
	go service.cleanupExpiredTokens()

	return service
}

// GenerateToken generates a new access token for an instance
func (s *InstanceAccessService) GenerateToken(userID, instanceID int, instanceType string, accessURL string, targetPort int32, duration time.Duration) (*AccessToken, error) {
	// Generate random token
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	token := hex.EncodeToString(tokenBytes)
	now := time.Now()

	accessToken := &AccessToken{
		Token:        token,
		InstanceID:   instanceID,
		UserID:       userID,
		InstanceType: instanceType,
		TargetPort:   targetPort,
		AccessURL:    accessURL,
		ExpiresAt:    now.Add(duration),
		CreatedAt:    now,
	}

	s.mu.Lock()
	s.tokens[token] = accessToken
	s.mu.Unlock()

	return accessToken, nil
}

// ValidateToken validates an access token
func (s *InstanceAccessService) ValidateToken(token string) (*AccessToken, error) {
	s.mu.RLock()
	accessToken, exists := s.tokens[token]
	s.mu.RUnlock()

	if !exists {
		return nil, fmt.Errorf("invalid token")
	}

	if time.Now().After(accessToken.ExpiresAt) {
		s.mu.Lock()
		delete(s.tokens, token)
		s.mu.Unlock()
		return nil, fmt.Errorf("token expired")
	}

	return accessToken, nil
}

// RevokeToken revokes an access token
func (s *InstanceAccessService) RevokeToken(token string) {
	s.mu.Lock()
	delete(s.tokens, token)
	s.mu.Unlock()
}

// GetAccessURL generates access URL for an instance
func (s *InstanceAccessService) GetAccessURL(instanceID int, instanceType string, podIP string, podName string) string {
	// Generate access URL based on instance type
	switch instanceType {
	case "openclaw":
		// OpenClaw desktop typically uses VNC or web interface
		if podIP != "" {
			return fmt.Sprintf("https://%s:3001/", podIP)
		}
	case "ubuntu", "debian", "centos":
		// Linux desktops typically use noVNC or similar
		if podIP != "" {
			return fmt.Sprintf("http://%s:6901/vnc.html", podIP)
		}
	default:
		// Default VNC access
		if podIP != "" {
			return fmt.Sprintf("http://%s:6080/vnc.html", podIP)
		}
	}

	// Fallback to pod name based URL (for ingress/routing scenarios)
	if podName != "" {
		return fmt.Sprintf("/access/instance/%d", instanceID)
	}

	return ""
}

// GetAccessURLWithEndpoint generates access URL using the provided endpoint (nodeIP:port or direct IP)
func (s *InstanceAccessService) GetAccessURLWithEndpoint(instanceID int, instanceType string, endpoint string) string {
	if endpoint == "" {
		return ""
	}

	// Generate access URL based on instance type
	switch instanceType {
	case "openclaw":
		// OpenClaw desktop typically uses VNC or web interface
		return fmt.Sprintf("https://%s/", endpoint)
	case "ubuntu", "debian", "centos":
		// Linux desktops typically use noVNC or similar
		return fmt.Sprintf("http://%s/vnc.html", endpoint)
	default:
		// Default VNC access
		return fmt.Sprintf("http://%s/vnc.html", endpoint)
	}
}

// GetProxyURL generates a proxied access URL
func (s *InstanceAccessService) GetProxyURL(instanceID int, token string) string {
	return fmt.Sprintf("/api/v1/instances/%d/access?token=%s", instanceID, token)
}

// cleanupExpiredTokens periodically removes expired tokens
func (s *InstanceAccessService) cleanupExpiredTokens() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		now := time.Now()
		s.mu.Lock()
		for token, accessToken := range s.tokens {
			if now.After(accessToken.ExpiresAt) {
				delete(s.tokens, token)
			}
		}
		s.mu.Unlock()
	}
}

// GetActiveTokenCount returns the number of active tokens
func (s *InstanceAccessService) GetActiveTokenCount() int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return len(s.tokens)
}
