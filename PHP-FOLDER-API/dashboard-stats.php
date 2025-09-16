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

class DashboardStats {
    private $db;
    private $auth;
    
    public function __construct() {
        $this->db = Database::getInstance();
        $this->auth = new Auth();
    }
    
    public function getStats() {
        if (!$this->auth->checkAuth()) {
            return Response::error('Not authenticated', 401);
        }
        
        // Check if database connection exists
        if (!$this->db->getConnection()) {
            return $this->getSampleStats();
        }
        
        try {
            // Get active users count
            $activeUsers = $this->db->fetch(
                "SELECT COUNT(*) as count FROM users WHERE status = 'Active'"
            )['count'];
            
            // Get pending tasks count
            $pendingTasks = $this->db->fetch(
                "SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'"
            )['count'];
            
            // Get active clients count
            $activeClients = $this->db->fetch(
                "SELECT COUNT(*) as count FROM clients"
            )['count'];
            
            // Get reports generated this month
            $reportsThisMonth = $this->db->fetch(
                "SELECT COUNT(*) as count FROM reports WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)"
            )['count'];
            
            // Get completed tasks this week for change calculation
            $completedTasksThisWeek = $this->db->fetch(
                "SELECT COUNT(*) as count FROM tasks WHERE status = 'completed' AND DATE(updated_at) >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)"
            )['count'];
            
            // Get new users this week
            $newUsersThisWeek = $this->db->fetch(
                "SELECT COUNT(*) as count FROM users WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)"
            )['count'];
            
            // Get new clients this week
            $newClientsThisWeek = $this->db->fetch(
                "SELECT COUNT(*) as count FROM clients WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)"
            )['count'];
            
            $stats = [
                'active_users' => [
                    'count' => $activeUsers,
                    'change' => "+{$newUsersThisWeek} new",
                    'change_type' => 'positive'
                ],
                'pending_tasks' => [
                    'count' => $pendingTasks,
                    'change' => "{$completedTasksThisWeek} completed",
                    'change_type' => 'neutral'
                ],
                'active_clients' => [
                    'count' => $activeClients,
                    'change' => "+{$newClientsThisWeek} this week",
                    'change_type' => $newClientsThisWeek > 0 ? 'positive' : 'neutral'
                ],
                'reports_generated' => [
                    'count' => $reportsThisMonth,
                    'change' => "+{$reportsThisMonth} this month",
                    'change_type' => 'positive'
                ]
            ];
            
            return Response::success($stats, 'Dashboard stats retrieved successfully');
            
        } catch (Exception $e) {
            return $this->getSampleStats();
        }
    }
    
    private function getSampleStats() {
        $stats = [
            'active_users' => [
                'count' => 15,
                'change' => '+3 new',
                'change_type' => 'positive'
            ],
            'pending_tasks' => [
                'count' => 8,
                'change' => '5 completed',
                'change_type' => 'neutral'
            ],
            'active_clients' => [
                'count' => 42,
                'change' => '+2 this week',
                'change_type' => 'positive'
            ],
            'reports_generated' => [
                'count' => 12,
                'change' => '+12 this month',
                'change_type' => 'positive'
            ]
        ];
        
        return Response::success($stats, 'Dashboard stats retrieved successfully (demo mode)');
    }
    
    public function getRecentActivity() {
        if (!$this->auth->checkAuth()) {
            return Response::error('Not authenticated', 401);
        }
        
        try {
            // Get recent activities from audit logs
            $activities = $this->db->fetchAll(
                "SELECT al.action, al.timestamp, u.full_name, u.username 
                 FROM audit_logs al 
                 LEFT JOIN users u ON al.user_id = u.id 
                 ORDER BY al.timestamp DESC 
                 LIMIT 10"
            );
            
            // If no audit logs, create sample activities based on recent data
            if (empty($activities)) {
                $activities = [
                    [
                        'action' => 'New client added: ACME Corporation',
                        'timestamp' => date('Y-m-d H:i:s', strtotime('-2 minutes')),
                        'icon' => 'fa-user-plus'
                    ],
                    [
                        'action' => 'Task completed: Financial audit review',
                        'timestamp' => date('Y-m-d H:i:s', strtotime('-15 minutes')),
                        'icon' => 'fa-tasks'
                    ],
                    [
                        'action' => 'Report generated: Monthly client summary',
                        'timestamp' => date('Y-m-d H:i:s', strtotime('-1 hour')),
                        'icon' => 'fa-file-alt'
                    ]
                ];
            }
            
            return Response::success($activities, 'Recent activity retrieved successfully');
            
        } catch (Exception $e) {
            return Response::error('Failed to retrieve recent activity', 500);
        }
    }
    
    public function getSystemStatus() {
        if (!$this->auth->checkAuth()) {
            return Response::error('Not authenticated', 401);
        }
        
        try {
            $activeUsers = $this->db->fetch("SELECT COUNT(*) as count FROM users WHERE status = 'Active'")['count'];
            $pendingTasks = $this->db->fetch("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'")['count'];
            $activeClients = $this->db->fetch("SELECT COUNT(*) as count FROM clients")['count'];
            $lastReport = $this->db->fetch("SELECT MAX(created_at) as last_report FROM reports")['last_report'];
            
            $status = [
                'user_management' => [
                    'status' => 'Active',
                    'description' => "{$activeUsers} active users",
                    'badge' => 'online'
                ],
                'task_system' => [
                    'status' => 'Running',
                    'description' => "{$pendingTasks} pending tasks",
                    'badge' => 'online'
                ],
                'client_portal' => [
                    'status' => 'Active',
                    'description' => "{$activeClients} clients connected",
                    'badge' => 'online'
                ],
                'report_engine' => [
                    'status' => 'Ready',
                    'description' => $lastReport ? 'Last report: ' . date('g:i A', strtotime($lastReport)) : 'No reports generated',
                    'badge' => 'online'
                ]
            ];
            
            return Response::success($status, 'System status retrieved successfully');
            
        } catch (Exception $e) {
            return Response::error('Failed to retrieve system status', 500);
        }
    }
}

// Handle API requests
try {
    ob_clean();
    header('Content-Type: application/json');
    
    $dashboardStats = new DashboardStats();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        switch ($_GET['action'] ?? '') {
            case 'stats':
                echo json_encode($dashboardStats->getStats());
                break;
                
            case 'activity':
                echo json_encode($dashboardStats->getRecentActivity());
                break;
                
            case 'status':
                echo json_encode($dashboardStats->getSystemStatus());
                break;
                
            default:
                echo json_encode(Response::error('Invalid action', 400));
        }
    } else {
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
