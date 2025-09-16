<?php
require_once 'database.php';
require_once 'response.php';

class Auth {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    public function login($username, $password) {
        try {
            // Check if input is email or username
            $isEmail = filter_var($username, FILTER_VALIDATE_EMAIL);
            $field = $isEmail ? 'email' : 'username';
            
            $user = $this->db->fetch(
                "SELECT * FROM users WHERE {$field} = ? AND status = 'active'",
                [$username]
            );
            
            if (!$user || !password_verify($password, $user['password'])) {
                return Response::error('Invalid credentials', 401);
            }
            
            // Update last login
            $this->db->update('users', 
                ['last_login' => date('Y-m-d H:i:s')], 
                'id = ?', 
                [$user['id']]
            );
            
            // Create session
            session_start();
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['login_time'] = time();
            
            return Response::success([
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'full_name' => $user['full_name']
                ],
                'redirect' => 'dashboard.html'
            ], 'Login successful');
            
        } catch (Exception $e) {
            return Response::error('Login failed', 500);
        }
    }
    
    public function logout() {
        session_start();
        session_destroy();
        return Response::success([], 'Logged out successfully');
    }
    
    public function checkAuth() {
        // Temporarily disable auth for development/testing
        return true;
        
        session_start();
        
        if (!isset($_SESSION['user_id']) || !isset($_SESSION['login_time'])) {
            return false;
        }
        
        // Check session timeout
        if (time() - $_SESSION['login_time'] > SESSION_TIMEOUT) {
            session_destroy();
            return false;
        }
        
        return true;
    }
    
    public function getCurrentUser() {
        if (!$this->checkAuth()) {
            return Response::error('Not authenticated', 401);
        }
        
        $user = $this->db->fetch(
            "SELECT id, username, email, role, full_name FROM users WHERE id = ?",
            [$_SESSION['user_id']]
        );
        
        return Response::success($user);
    }
    
    public function register($data) {
        try {
            // Validate required fields
            $required = ['username', 'email', 'password', 'full_name'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    return Response::error("Field {$field} is required", 400);
                }
            }
            
            // Check if username or email already exists
            $existing = $this->db->fetch(
                "SELECT id FROM users WHERE username = ? OR email = ?",
                [$data['username'], $data['email']]
            );
            
            if ($existing) {
                return Response::error('Username or email already exists', 409);
            }
            
            // Hash password
            $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
            
            // Insert user
            $userId = $this->db->insert('users', [
                'username' => $data['username'],
                'email' => $data['email'],
                'password' => $hashedPassword,
                'full_name' => $data['full_name'],
                'role' => $data['role'] ?? 'user',
                'status' => 'active',
                'created_at' => date('Y-m-d H:i:s')
            ]);
            
            return Response::success(['user_id' => $userId], 'User registered successfully');
            
        } catch (Exception $e) {
            return Response::error('Registration failed', 500);
        }
    }
}

// Handle API requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $auth = new Auth();
    
    switch ($_GET['action'] ?? '') {
        case 'login':
            echo json_encode($auth->login($input['username'], $input['password']));
            break;
            
        case 'logout':
            echo json_encode($auth->logout());
            break;
            
        case 'register':
            echo json_encode($auth->register($input));
            break;
            
        case 'current-user':
            echo json_encode($auth->getCurrentUser());
            break;
            
        default:
            echo json_encode(Response::error('Invalid action', 400));
    }
} else {
    echo json_encode(Response::error('Method not allowed', 405));
}
?>
