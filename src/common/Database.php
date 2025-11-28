<?php
class Database {
    private $host = 'localhost';
    private $db_name = 'web_db';          // Must match your database name
    private $username = 'root';            // Default XAMPP username
    private $password = '';                // Default XAMPP password (empty)
    private $conn = null;
    
    public function getConnection() {
        if ($this->conn !== null) {
            return $this->conn;
        }
        
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
            
        } catch (PDOException $e) {
            error_log("Database Connection Error: " . $e->getMessage());
            throw new Exception("Database connection failed.");
        }
        
        return $this->conn;
    }
}
?>
```

**Important:** Make sure:
- `$db_name = 'web_db';` (matches your database)
- `$username = 'root';`
- `$password = '';` (empty string for XAMPP)

---

## 🧪 Step 2: Test Your Connection

### **Test the Login API**

1. **Make sure XAMPP Apache and MySQL are running** ✅

2. **Open your browser and go to:**
```
   http://localhost/course-project-itcs333-section-6_groupproject1/src/auth/api/index.php