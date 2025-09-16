<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config.php';
require_once 'database.php';

class FeedbackAPI {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        switch ($method) {
            case 'POST':
                return $this->submitFeedback();
            case 'GET':
                return $this->getFeedbackStats();
            default:
                return $this->sendResponse(405, ['error' => 'Method not allowed']);
        }
    }
    
    private function submitFeedback() {
        try {
            // Get JSON input
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (!isset($input['name']) || !isset($input['rating']) || !isset($input['message'])) {
                return $this->sendResponse(400, ['error' => 'Missing required fields']);
            }
            
            // Sanitize input
            $name = trim($input['name']);
            $email = isset($input['email']) ? trim($input['email']) : null;
            $rating = (int)$input['rating'];
            $message = trim($input['message']);
            
            // Validate data
            if (empty($name) || empty($message)) {
                return $this->sendResponse(400, ['error' => 'Name and message cannot be empty']);
            }
            
            if ($rating < 1 || $rating > 5) {
                return $this->sendResponse(400, ['error' => 'Rating must be between 1 and 5']);
            }
            
            if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return $this->sendResponse(400, ['error' => 'Invalid email format']);
            }
            
            // Get client info
            $ip_address = $_SERVER['REMOTE_ADDR'] ?? null;
            $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;
            
            // Insert feedback
            $conn = $this->db->getConnection();
            $stmt = $conn->prepare("
                INSERT INTO feedback (name, email, rating, message, ip_address, user_agent) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->bind_param("ssisss", $name, $email, $rating, $message, $ip_address, $user_agent);
            
            if ($stmt->execute()) {
                $feedback_id = $conn->insert_id;
                
                // Update stats
                $this->updateStats($rating);
                
                // Get updated stats
                $stats = $this->getStats();
                
                return $this->sendResponse(200, [
                    'success' => true,
                    'message' => 'Feedback submitted successfully',
                    'feedback_id' => $feedback_id,
                    'stats' => $stats
                ]);
            } else {
                return $this->sendResponse(500, ['error' => 'Failed to submit feedback']);
            }
            
        } catch (Exception $e) {
            error_log("Feedback submission error: " . $e->getMessage());
            return $this->sendResponse(500, ['error' => 'Internal server error']);
        }
    }
    
    private function updateStats($rating) {
        try {
            $conn = $this->db->getConnection();
            
            // Get current stats
            $stmt = $conn->prepare("SELECT * FROM feedback_stats WHERE id = 1");
            $stmt->execute();
            $result = $stmt->get_result();
            $stats = $result->fetch_assoc();
            
            if ($stats) {
                // Calculate new stats
                $total_feedback = $stats['total_feedback'] + 1;
                $satisfied_clients = $stats['satisfied_clients'] + 1;
                
                // Calculate new average rating
                $stmt = $conn->prepare("SELECT AVG(rating) as avg_rating FROM feedback");
                $stmt->execute();
                $result = $stmt->get_result();
                $avg_data = $result->fetch_assoc();
                $average_rating = round($avg_data['avg_rating'], 2);
                
                // Update compliance rate (increase if rating >= 4)
                $compliance_rate = $stats['compliance_rate'];
                if ($rating >= 4 && $compliance_rate < 100) {
                    $compliance_rate = min(100, $compliance_rate + 1);
                }
                
                // Update stats
                $stmt = $conn->prepare("
                    UPDATE feedback_stats 
                    SET total_feedback = ?, satisfied_clients = ?, average_rating = ?, compliance_rate = ?
                    WHERE id = 1
                ");
                $stmt->bind_param("iidi", $total_feedback, $satisfied_clients, $average_rating, $compliance_rate);
                $stmt->execute();
            }
            
        } catch (Exception $e) {
            error_log("Stats update error: " . $e->getMessage());
        }
    }
    
    private function getFeedbackStats() {
        try {
            $stats = $this->getStats();
            return $this->sendResponse(200, ['stats' => $stats]);
        } catch (Exception $e) {
            error_log("Get stats error: " . $e->getMessage());
            return $this->sendResponse(500, ['error' => 'Failed to get stats']);
        }
    }
    
    private function getStats() {
        $conn = $this->db->getConnection();
        $stmt = $conn->prepare("SELECT * FROM feedback_stats WHERE id = 1");
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
    
    private function sendResponse($status_code, $data) {
        http_response_code($status_code);
        echo json_encode($data);
        exit;
    }
}

// Initialize and handle request
$api = new FeedbackAPI();
$api->handleRequest();
?>
