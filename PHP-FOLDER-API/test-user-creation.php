<?php
// Test script to verify user creation functionality
require_once 'database.php';
require_once 'response.php';
require_once 'config.php';

// Test database connection
try {
    $db = Database::getInstance();
    echo "✅ Database connection successful\n";
    
    // Test if users table exists
    $result = $db->fetch("SHOW TABLES LIKE 'users'");
    if ($result) {
        echo "✅ Users table exists\n";
        
        // Check table structure
        $columns = $db->fetchAll("DESCRIBE users");
        echo "✅ Users table structure:\n";
        foreach ($columns as $column) {
            echo "   - {$column['Field']} ({$column['Type']})\n";
        }
        
        // Test user creation
        $testUser = [
            'username' => 'test_user_' . time(),
            'email' => 'test' . time() . '@example.com',
            'password' => password_hash('testpass123', PASSWORD_DEFAULT),
            'full_name' => 'Test User',
            'role' => 'Client',
            'status' => 'Active',
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        $userId = $db->insert('users', $testUser);
        echo "✅ Test user created with ID: {$userId}\n";
        
        // Verify user was created
        $createdUser = $db->fetch("SELECT * FROM users WHERE id = ?", [$userId]);
        if ($createdUser) {
            echo "✅ User verification successful\n";
            echo "   - Username: {$createdUser['username']}\n";
            echo "   - Email: {$createdUser['email']}\n";
            echo "   - Full Name: {$createdUser['full_name']}\n";
            echo "   - Role: {$createdUser['role']}\n";
            echo "   - Status: {$createdUser['status']}\n";
        }
        
        // Clean up test user
        $db->delete('users', 'id = ?', [$userId]);
        echo "✅ Test user cleaned up\n";
        
    } else {
        echo "❌ Users table does not exist\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n=== User Creation API Test Complete ===\n";
?>
