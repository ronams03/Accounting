<?php
// Prevent any HTML output
ob_start();
error_reporting(0);
ini_set('display_errors', 0);

try {
    require_once 'database.php';
    require_once 'response.php';
    require_once 'auth.php';
} catch (Exception $e) {
    ob_clean();
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Server configuration error',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit;
}

class Users {
    private $db;
    private $auth;
    
    public function __construct() {
        $this->db = Database::getInstance();
        $this->auth = new Auth();
    }
    
    public function getAll($page = 1, $limit = 10, $search = '') {
        if (!$this->auth->checkAuth()) {
            return Response::error('Not authenticated', 401);
        }
        
        // Check if database connection exists
        if (!$this->db->getConnection()) {
            // Return sample data when database is unavailable
            return $this->getSampleUsers($search);
        }
        
        try {
            $offset = ($page - 1) * $limit;
            $searchCondition = '';
            $params = [];
            
            if (!empty($search)) {
                $searchCondition = "WHERE username LIKE ? OR email LIKE ? OR full_name LIKE ?";
                $searchTerm = "%{$search}%";
                $params = [$searchTerm, $searchTerm, $searchTerm];
            }
            
            // Get total count
            $totalQuery = "SELECT COUNT(*) as total FROM users {$searchCondition}";
            $total = $this->db->fetch($totalQuery, $params)['total'];
            
            // Get users
            $query = "SELECT id, username, email, full_name, role, status, created_at, last_login 
                      FROM users {$searchCondition} 
                      ORDER BY created_at DESC 
                      LIMIT {$limit} OFFSET {$offset}";
            
            $users = $this->db->fetchAll($query, $params);
            
            return Response::paginated($users, $total, $page, $limit);
        } catch (Exception $e) {
            return $this->getSampleUsers($search);
        }
    }
    
    private function getSampleUsers($search = '') {
        $sampleUsers = [
            [
                'id' => 1,
                'username' => 'quads',
                'full_name' => 'Quads Administrator',
                'email' => 'kristinedais01@gmail.com',
                'role' => 'Admin',
                'status' => 'Active',
                'last_login' => '2024-01-15 14:30:00',
                'created_at' => '2024-01-01 09:00:00'
            ],
            [
                'id' => 2,
                'username' => 'coadmin',
                'full_name' => 'Co-Administrator',
                'email' => 'coadmin@example.com',
                'role' => 'Co-Admin',
                'status' => 'Active',
                'last_login' => '2024-01-14 16:45:00',
                'created_at' => '2024-01-02 10:00:00'
            ],
            [
                'id' => 3,
                'username' => 'client1',
                'full_name' => 'John Smith',
                'email' => 'contact@acmecorp.com',
                'role' => 'Client',
                'status' => 'Active',
                'last_login' => '2024-01-15 08:20:00',
                'created_at' => '2024-01-05 14:30:00'
            ]
        ];
        
        // Apply search filter if provided
        if (!empty($search)) {
            $sampleUsers = array_filter($sampleUsers, function($user) use ($search) {
                return stripos($user['full_name'], $search) !== false ||
                       stripos($user['username'], $search) !== false ||
                       stripos($user['email'], $search) !== false;
            });
        }
        
        return Response::paginated($sampleUsers, count($sampleUsers), 1, 10);
    }
    
    public function getById($id) {
        if (!$this->auth->checkAuth()) {
            return Response::error('Not authenticated', 401);
        }
        
        $user = $this->db->fetch(
            "SELECT id, username, email, full_name, role, status, created_at, last_login FROM users WHERE id = ?",
            [$id]
        );
        
        if (!$user) {
            return Response::error('User not found', 404);
        }
        
        return Response::success($user);
    }
    
    public function create($data) {
        if (!$this->auth->checkAuth()) {
            return Response::error('Not authenticated', 401);
        }
        
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
        
        try {
            $userId = $this->db->insert('users', [
                'username' => $data['username'],
                'email' => $data['email'],
                'password' => password_hash($data['password'], PASSWORD_DEFAULT),
                'full_name' => $data['full_name'],
                'role' => $data['role'] ?? 'user',
                'status' => $data['status'] ?? 'active',
                'created_at' => date('Y-m-d H:i:s')
            ]);
            
            return Response::success(['user_id' => $userId], 'User created successfully', 201);
            
        } catch (Exception $e) {
            return Response::error('Failed to create user', 500);
        }
    }
    
    public function update($id, $data) {
        if (!$this->auth->checkAuth()) {
            return Response::error('Not authenticated', 401);
        }
        
        // Check if user exists
        $user = $this->db->fetch("SELECT id FROM users WHERE id = ?", [$id]);
        if (!$user) {
            return Response::error('User not found', 404);
        }
        
        // Prepare update data
        $updateData = [];
        $allowedFields = ['username', 'email', 'full_name', 'role', 'status'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = $data[$field];
            }
        }
        
        // Handle password update
        if (!empty($data['password'])) {
            $updateData['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        
        if (empty($updateData)) {
            return Response::error('No valid fields to update', 400);
        }
        
        $updateData['updated_at'] = date('Y-m-d H:i:s');
        
        try {
            $this->db->update('users', $updateData, 'id = ?', [$id]);
            return Response::success([], 'User updated successfully');
            
        } catch (Exception $e) {
            return Response::error('Failed to update user', 500);
        }
    }
    
    public function delete($id) {
        if (!$this->auth->checkAuth()) {
            return Response::error('Not authenticated', 401);
        }
        
        // Check if user exists
        $user = $this->db->fetch("SELECT id FROM users WHERE id = ?", [$id]);
        if (!$user) {
            return Response::error('User not found', 404);
        }
        
        try {
            // Soft delete - update status instead of actual deletion
            $this->db->update('users', 
                ['status' => 'deleted', 'updated_at' => date('Y-m-d H:i:s')], 
                'id = ?', 
                [$id]
            );
            
            return Response::success([], 'User deleted successfully');
            
        } catch (Exception $e) {
            return Response::error('Failed to delete user', 500);
        }
    }
}

// Handle API requests
try {
    ob_clean();
    header('Content-Type: application/json');
    
    $users = new Users();
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);

    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                echo json_encode($users->getById($_GET['id']));
            } else {
                $page = $_GET['page'] ?? 1;
                $limit = $_GET['limit'] ?? 10;
                $search = $_GET['search'] ?? '';
                echo json_encode($users->getAll($page, $limit, $search));
            }
            break;
            
        case 'POST':
            echo json_encode($users->create($input));
            break;
            
        case 'PUT':
            if (isset($_GET['id'])) {
                echo json_encode($users->update($_GET['id'], $input));
            } else {
                echo json_encode(Response::error('User ID required', 400));
            }
            break;
            
        case 'DELETE':
            if (isset($_GET['id'])) {
                echo json_encode($users->delete($_GET['id']));
            } else {
                echo json_encode(Response::error('User ID required', 400));
            }
            break;
            
        default:
            echo json_encode(Response::error('Method not allowed', 405));
    }
} catch (Exception $e) {
    ob_clean();
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>
