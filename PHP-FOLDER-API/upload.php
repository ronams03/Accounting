<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config.php';
require_once 'database.php';

class FileUpload {
    private $db;
    private $uploadDir;
    private $maxFileSize;
    
    public function __construct() {
        $this->db = new Database();
        $this->uploadDir = '../uploads/documents/';
        $this->maxFileSize = 5 * 1024 * 1024 * 1024; // 5GB in bytes
        
        // Create upload directory if it doesn't exist
        if (!file_exists($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }
    
    public function uploadFile() {
        try {
            // Check if file was uploaded
            if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
                return $this->errorResponse('No file uploaded or upload error occurred');
            }
            
            $file = $_FILES['file'];
            
            // Validate file size
            if ($file['size'] > $this->maxFileSize) {
                return $this->errorResponse('File size exceeds 5GB limit');
            }
            
            // Get file information
            $originalName = $file['name'];
            $fileSize = $file['size'];
            $tmpName = $file['tmp_name'];
            $fileExtension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
            
            // Generate unique filename
            $uniqueId = uniqid();
            $fileName = $uniqueId . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $originalName);
            $filePath = $this->uploadDir . $fileName;
            
            // Move uploaded file
            if (!move_uploaded_file($tmpName, $filePath)) {
                return $this->errorResponse('Failed to save uploaded file');
            }
            
            // Get file category based on extension
            $category = $this->getFileCategory($fileExtension);
            
            // Save file information to database
            $fileId = $this->saveFileToDatabase($originalName, $fileName, $fileSize, $category, $fileExtension);
            
            if (!$fileId) {
                // Clean up uploaded file if database save failed
                unlink($filePath);
                return $this->errorResponse('Failed to save file information to database');
            }
            
            return $this->successResponse([
                'file_id' => $fileId,
                'original_name' => $originalName,
                'file_name' => $fileName,
                'file_size' => $fileSize,
                'category' => $category,
                'extension' => $fileExtension,
                'upload_date' => date('Y-m-d H:i:s')
            ], 'File uploaded successfully');
            
        } catch (Exception $e) {
            return $this->errorResponse('Upload failed: ' . $e->getMessage());
        }
    }
    
    private function saveFileToDatabase($originalName, $fileName, $fileSize, $category, $extension) {
        try {
            // Get current user ID from session
            session_start();
            $userId = $_SESSION['user_id'] ?? 1; // Default to client user for demo
            
            $sql = "INSERT INTO client_documents (user_id, original_name, file_name, file_size, category, file_extension, upload_date, status) 
                    VALUES (?, ?, ?, ?, ?, ?, NOW(), 'active')";
            
            $result = $this->db->execute($sql, [
                $userId,
                $originalName,
                $fileName,
                $fileSize,
                $category,
                $extension
            ]);
            
            return $this->db->getConnection()->lastInsertId();
            
        } catch (Exception $e) {
            error_log('Database error: ' . $e->getMessage());
            return false;
        }
    }
    
    private function getFileCategory($extension) {
        $categories = [
            'financial' => ['xlsx', 'xls', 'csv', 'ods'],
            'tax' => ['pdf', 'doc', 'docx'],
            'contracts' => ['pdf', 'doc', 'docx', 'txt'],
            'receipts' => ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp'],
            'other' => []
        ];
        
        foreach ($categories as $category => $extensions) {
            if (in_array($extension, $extensions)) {
                return $category;
            }
        }
        
        return 'other';
    }
    
    private function successResponse($data, $message = 'Success') {
        return json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data
        ]);
    }
    
    private function errorResponse($message) {
        return json_encode([
            'success' => false,
            'message' => $message
        ]);
    }
}

// Handle the request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $upload = new FileUpload();
    echo $upload->uploadFile();
} else {
    echo json_encode(['success' => false, 'message' => 'Only POST method allowed']);
}
?>
