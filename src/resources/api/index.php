<?php
session_start();
$_SESSION['user'] = [
    'role' => 'student',
    'logged_in' => true
];

/**
 * Course Resources API
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database connection
require_once '../../common/Database.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Get HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Get request body
$input = json_decode(file_get_contents('php://input'), true);

// Parse query parameters
$action = isset($_GET['action']) ? $_GET['action'] : null;
$id = isset($_GET['id']) ? $_GET['id'] : null;
$resource_id = isset($_GET['resource_id']) ? $_GET['resource_id'] : null;
$comment_id = isset($_GET['comment_id']) ? $_GET['comment_id'] : null;

// Helper function to send JSON response
function sendResponse($success, $message = '', $data = null) {
    $response = ['success' => $success];
    
    if ($message) {
        $response['message'] = $message;
    }
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    exit;
}

// ============================================================================
// RESOURCE FUNCTIONS
// ============================================================================

/**
 * Get all resources
 */
function getAllResources($db) {
    $sql = "SELECT id, title, description, link, created_at FROM resources WHERE 1=1";
    $params = [];
    
    // Search functionality
    if (isset($_GET['search']) && !empty($_GET['search'])) {
        $search = $_GET['search'];
        $sql .= " AND (title LIKE :search OR description LIKE :search)";
        $params[':search'] = "%{$search}%";
    }
    
    // Sorting
    $sort = 'created_at';
    if (isset($_GET['sort']) && in_array($_GET['sort'], ['title', 'created_at'])) {
        $sort = $_GET['sort'];
    }
    
    $order = 'DESC';
    if (isset($_GET['order']) && in_array(strtoupper($_GET['order']), ['ASC', 'DESC'])) {
        $order = strtoupper($_GET['order']);
    }
    
    $sql .= " ORDER BY {$sort} {$order}";
    
    $stmt = $db->prepare($sql);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->execute();
    $resources = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendResponse(true, 'Resources retrieved successfully', $resources);
}

/**
 * Get a single resource by ID
 */
function getResourceById($db, $resourceId) {
    if (empty($resourceId) || !is_numeric($resourceId)) {
        http_response_code(400);
        sendResponse(false, 'Invalid resource ID');
        return;
    }
    
    $sql = "SELECT id, title, description, link, created_at FROM resources WHERE id = ?";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(1, $resourceId, PDO::PARAM_INT);
    $stmt->execute();
    
    $resource = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($resource) {
        sendResponse(true, 'Resource retrieved successfully', $resource);
    } else {
        http_response_code(404);
        sendResponse(false, 'Resource not found');
    }
}

/**
 * Create a new resource
 */
function createResource($db, $data) {
    if (empty($data['title']) || empty($data['link'])) {
        http_response_code(400);
        sendResponse(false, 'Title and link are required fields');
        return;
    }
    
    $title = trim($data['title']);
    $description = isset($data['description']) ? trim($data['description']) : '';
    $link = trim($data['link']);
    
    if (!filter_var($link, FILTER_VALIDATE_URL)) {
        http_response_code(400);
        sendResponse(false, 'Invalid URL format for link');
        return;
    }
    
    $sql = "INSERT INTO resources (title, description, link) VALUES (?, ?, ?)";
    $stmt = $db->prepare($sql);
    
    try {
        $stmt->execute([$title, $description, $link]);
        
        if ($stmt->rowCount() > 0) {
            $newId = $db->lastInsertId();
            http_response_code(201);
            sendResponse(true, 'Resource created successfully', ['id' => $newId]);
        } else {
            http_response_code(500);
            sendResponse(false, 'Failed to create resource');
        }
    } catch (PDOException $e) {
        http_response_code(500);
        sendResponse(false, 'Database error: ' . $e->getMessage());
    }
}

/**
 * Update an existing resource
 */
function updateResource($db, $data) {
    if (empty($data['id']) || !is_numeric($data['id'])) {
        http_response_code(400);
        sendResponse(false, 'Resource ID is required and must be numeric');
        return;
    }
    
    // Check if resource exists
    $checkSql = "SELECT id FROM resources WHERE id = ?";
    $checkStmt = $db->prepare($checkSql);
    $checkStmt->bindParam(1, $data['id'], PDO::PARAM_INT);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() === 0) {
        http_response_code(404);
        sendResponse(false, 'Resource not found');
        return;
    }
    
    $updateFields = [];
    $updateValues = [];
    
    if (isset($data['title']) && !empty(trim($data['title']))) {
        $updateFields[] = "title = ?";
        $updateValues[] = trim($data['title']);
    }
    
    if (isset($data['description'])) {
        $updateFields[] = "description = ?";
        $updateValues[] = trim($data['description']);
    }
    
    if (isset($data['link']) && !empty(trim($data['link']))) {
        if (!filter_var(trim($data['link']), FILTER_VALIDATE_URL)) {
            http_response_code(400);
            sendResponse(false, 'Invalid URL format for link');
            return;
        }
        $updateFields[] = "link = ?";
        $updateValues[] = trim($data['link']);
    }
    
    if (empty($updateFields)) {
        http_response_code(400);
        sendResponse(false, 'No fields provided for update');
        return;
    }
    
    $sql = "UPDATE resources SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $updateValues[] = $data['id'];
    
    $stmt = $db->prepare($sql);
    
    try {
        $stmt->execute($updateValues);
        
        if ($stmt->rowCount() > 0) {
            sendResponse(true, 'Resource updated successfully');
        } else {
            sendResponse(true, 'Resource updated (no changes detected)');
        }
    } catch (PDOException $e) {
        http_response_code(500);
        sendResponse(false, 'Database error: ' . $e->getMessage());
    }
}

/**
 * Delete a resource
 */
function deleteResource($db, $resourceId) {
    if (empty($resourceId) || !is_numeric($resourceId)) {
        http_response_code(400);
        sendResponse(false, 'Invalid resource ID');
        return;
    }
    
    // Check if resource exists
    $checkSql = "SELECT id FROM resources WHERE id = ?";
    $checkStmt = $db->prepare($checkSql);
    $checkStmt->bindParam(1, $resourceId, PDO::PARAM_INT);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() === 0) {
        http_response_code(404);
        sendResponse(false, 'Resource not found');
        return;
    }
    
    try {
        $db->beginTransaction();
        
        // Delete associated comments
        $deleteCommentsSql = "DELETE FROM comments WHERE resource_id = ?";
        $deleteCommentsStmt = $db->prepare($deleteCommentsSql);
        $deleteCommentsStmt->bindParam(1, $resourceId, PDO::PARAM_INT);
        $deleteCommentsStmt->execute();
        
        // Delete the resource
        $deleteResourceSql = "DELETE FROM resources WHERE id = ?";
        $deleteResourceStmt = $db->prepare($deleteResourceSql);
        $deleteResourceStmt->bindParam(1, $resourceId, PDO::PARAM_INT);
        $deleteResourceStmt->execute();
        
        $db->commit();
        sendResponse(true, 'Resource and associated comments deleted successfully');
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        sendResponse(false, 'Failed to delete resource: ' . $e->getMessage());
    }
}

// ============================================================================
// COMMENT FUNCTIONS
// ============================================================================

/**
 * Get all comments for a specific resource
 */
function getCommentsByResourceId($db, $resourceId) {
    if (empty($resourceId) || !is_numeric($resourceId)) {
        http_response_code(400);
        sendResponse(false, 'Invalid resource ID');
        return;
    }
    
    $sql = "SELECT id, resource_id, author, text, created_at 
            FROM comments 
            WHERE resource_id = ? 
            ORDER BY created_at ASC";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(1, $resourceId, PDO::PARAM_INT);
    $stmt->execute();
    
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse(true, 'Comments retrieved successfully', $comments);
}

/**
 * Create a new comment
 */
function createComment($db, $data) {
    if (empty($data['resource_id']) || empty($data['author']) || empty($data['text'])) {
        http_response_code(400);
        sendResponse(false, 'Resource ID, author, and text are required fields');
        return;
    }
    
    if (!is_numeric($data['resource_id'])) {
        http_response_code(400);
        sendResponse(false, 'Resource ID must be numeric');
        return;
    }
    
    // Check if the resource exists
    $checkSql = "SELECT id FROM resources WHERE id = ?";
    $checkStmt = $db->prepare($checkSql);
    $checkStmt->bindParam(1, $data['resource_id'], PDO::PARAM_INT);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() === 0) {
        http_response_code(404);
        sendResponse(false, 'Resource not found');
        return;
    }
    
    $author = trim($data['author']);
    $text = trim($data['text']);
    $resource_id = (int)$data['resource_id'];
    
    $sql = "INSERT INTO comments (resource_id, author, text) VALUES (?, ?, ?)";
    $stmt = $db->prepare($sql);
    
    try {
        $stmt->execute([$resource_id, $author, $text]);
        
        if ($stmt->rowCount() > 0) {
            $newId = $db->lastInsertId();
            http_response_code(201);
            sendResponse(true, 'Comment created successfully', ['id' => $newId]);
        } else {
            http_response_code(500);
            sendResponse(false, 'Failed to create comment');
        }
    } catch (PDOException $e) {
        http_response_code(500);
        sendResponse(false, 'Database error: ' . $e->getMessage());
    }
}

/**
 * Delete a comment
 */
function deleteComment($db, $commentId) {
    if (empty($commentId) || !is_numeric($commentId)) {
        http_response_code(400);
        sendResponse(false, 'Invalid comment ID');
        return;
    }
    
    $checkSql = "SELECT id FROM comments WHERE id = ?";
    $checkStmt = $db->prepare($checkSql);
    $checkStmt->bindParam(1, $commentId, PDO::PARAM_INT);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() === 0) {
        http_response_code(404);
        sendResponse(false, 'Comment not found');
        return;
    }
    
    $sql = "DELETE FROM comments WHERE id = ?";
    $stmt = $db->prepare($sql);
    
    try {
        $stmt->bindParam(1, $commentId, PDO::PARAM_INT);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            sendResponse(true, 'Comment deleted successfully');
        } else {
            http_response_code(500);
            sendResponse(false, 'Failed to delete comment');
        }
    } catch (PDOException $e) {
        http_response_code(500);
        sendResponse(false, 'Database error: ' . $e->getMessage());
    }
}

// ============================================================================
// MAIN REQUEST ROUTER
// ============================================================================

try {
    // Route based on HTTP method and parameters
    switch ($method) {
        case 'GET':
            if ($action === 'comments') {
                getCommentsByResourceId($db, $resource_id);
            } elseif ($id) {
                getResourceById($db, $id);
            } else {
                getAllResources($db);
            }
            break;
            
        case 'POST':
            if ($action === 'comment') {
                createComment($db, $input);
            } else {
                createResource($db, $input);
            }
            break;
            
        case 'PUT':
            updateResource($db, $input);
            break;
            
        case 'DELETE':
            if ($action === 'delete_comment') {
                deleteComment($db, $comment_id);
            } else {
                deleteResource($db, $id);
            }
            break;
            
        default:
            http_response_code(405);
            sendResponse(false, 'Method not allowed');
            break;
    }
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    http_response_code(500);
    sendResponse(false, 'Internal server error');
} catch (Exception $e) {
    error_log('General error: ' . $e->getMessage());
    http_response_code(500);
    sendResponse(false, 'Internal server error');
}
?>
