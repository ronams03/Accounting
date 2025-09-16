<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config.php';
require_once 'database.php';

class InvoiceManager {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = $_GET['action'] ?? '';
        
        switch ($method) {
            case 'GET':
                if ($action === 'list') {
                    return $this->getInvoices();
                } elseif ($action === 'view' && isset($_GET['id'])) {
                    return $this->getInvoice($_GET['id']);
                } else {
                    return $this->getInvoices();
                }
                break;
            case 'POST':
                if ($action === 'pay') {
                    return $this->payInvoice();
                }
                break;
            default:
                return $this->errorResponse('Method not allowed', 405);
        }
    }
    
    public function getInvoices() {
        try {
            session_start();
            $userId = $_SESSION['user_id'] ?? 3; // Default to client user for demo
            
            $sql = "SELECT i.*, c.company_name, c.contact_person 
                    FROM invoices i 
                    LEFT JOIN clients c ON i.client_id = c.client_id 
                    WHERE i.client_user_id = ? 
                    ORDER BY i.created_date DESC";
            
            $invoices = $this->db->fetchAll($sql, [$userId]);
            
            // If no invoices found, return sample data
            if (empty($invoices)) {
                $invoices = $this->getSampleInvoices();
            }
            
            return $this->successResponse($invoices);
            
        } catch (Exception $e) {
            // Return sample data on error
            return $this->successResponse($this->getSampleInvoices());
        }
    }
    
    public function getInvoice($invoiceId) {
        try {
            session_start();
            $userId = $_SESSION['user_id'] ?? 3;
            
            $sql = "SELECT i.*, c.company_name, c.contact_person,
                           ii.description, ii.quantity, ii.unit_price, ii.total_amount as item_total
                    FROM invoices i 
                    LEFT JOIN clients c ON i.client_id = c.client_id 
                    LEFT JOIN invoice_items ii ON i.invoice_id = ii.invoice_id
                    WHERE i.invoice_id = ? AND i.client_user_id = ?";
            
            $result = $this->db->fetchAll($sql, [$invoiceId, $userId]);
            
            if (empty($result)) {
                return $this->errorResponse('Invoice not found', 404);
            }
            
            // Group invoice items
            $invoice = $result[0];
            $invoice['items'] = [];
            
            foreach ($result as $row) {
                if ($row['description']) {
                    $invoice['items'][] = [
                        'description' => $row['description'],
                        'quantity' => $row['quantity'],
                        'unit_price' => $row['unit_price'],
                        'total_amount' => $row['item_total']
                    ];
                }
            }
            
            return $this->successResponse($invoice);
            
        } catch (Exception $e) {
            return $this->errorResponse('Error retrieving invoice: ' . $e->getMessage());
        }
    }
    
    public function payInvoice() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $invoiceId = $input['invoice_id'] ?? null;
            
            if (!$invoiceId) {
                return $this->errorResponse('Invoice ID required');
            }
            
            session_start();
            $userId = $_SESSION['user_id'] ?? 3;
            
            // Update invoice status to paid
            $sql = "UPDATE invoices SET status = 'Paid', paid_date = NOW() 
                    WHERE invoice_id = ? AND client_user_id = ?";
            
            $result = $this->db->execute($sql, [$invoiceId, $userId]);
            
            if ($result) {
                return $this->successResponse(['message' => 'Invoice marked as paid successfully']);
            } else {
                return $this->errorResponse('Failed to update invoice status');
            }
            
        } catch (Exception $e) {
            return $this->errorResponse('Error processing payment: ' . $e->getMessage());
        }
    }
    
    private function getSampleInvoices() {
        return [
            [
                'invoice_id' => 1,
                'invoice_number' => 'INV-2024-001',
                'client_id' => 1,
                'company_name' => 'Sample Client Company',
                'contact_person' => 'John Client',
                'amount' => 2500.00,
                'tax_amount' => 250.00,
                'total_amount' => 2750.00,
                'status' => 'Pending',
                'due_date' => '2024-12-30',
                'created_date' => '2024-12-01',
                'paid_date' => null,
                'description' => 'Monthly Accounting Services - November 2024'
            ],
            [
                'invoice_id' => 2,
                'invoice_number' => 'INV-2024-002',
                'client_id' => 1,
                'company_name' => 'Sample Client Company',
                'contact_person' => 'John Client',
                'amount' => 1800.00,
                'tax_amount' => 180.00,
                'total_amount' => 1980.00,
                'status' => 'Paid',
                'due_date' => '2024-11-30',
                'created_date' => '2024-11-01',
                'paid_date' => '2024-11-25',
                'description' => 'Tax Preparation Services Q3 2024'
            ],
            [
                'invoice_id' => 3,
                'invoice_number' => 'INV-2024-003',
                'client_id' => 1,
                'company_name' => 'Sample Client Company',
                'contact_person' => 'John Client',
                'amount' => 3200.00,
                'tax_amount' => 320.00,
                'total_amount' => 3520.00,
                'status' => 'Overdue',
                'due_date' => '2024-10-15',
                'created_date' => '2024-09-15',
                'paid_date' => null,
                'description' => 'Annual Financial Audit Services'
            ]
        ];
    }
    
    private function successResponse($data, $message = 'Success') {
        return json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data
        ]);
    }
    
    private function errorResponse($message, $code = 400) {
        http_response_code($code);
        return json_encode([
            'success' => false,
            'message' => $message
        ]);
    }
}

// Handle the request
$invoiceManager = new InvoiceManager();
echo $invoiceManager->handleRequest();
?>
