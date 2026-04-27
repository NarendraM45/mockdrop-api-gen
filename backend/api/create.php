<?php
// backend/api/create.php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
    exit;
}

require_once __DIR__ . '/../config/db.php';

try {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Invalid JSON payload format"]);
        exit;
    }

    $payload = $data['payload'] ?? '';
    
    // Validate the core json mock response text
    $decodedPayload = json_decode($payload);
    if (json_last_error() !== JSON_ERROR_NONE || (!is_object($decodedPayload) && !is_array($decodedPayload))) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Invalid JSON payload"]);
        exit;
    }

    $label = $data['label'] ?? null;
    if ($label !== null) {
        $label = substr(trim($label), 0, 120);
    }
    
    $statusCode = isset($data['status_code']) ? (int)$data['status_code'] : 200;
    if ($statusCode < 100 || $statusCode > 599) $statusCode = 200;

    $delayMs = isset($data['delay_ms']) ? (int)$data['delay_ms'] : 0;
    if ($delayMs < 0) $delayMs = 0;

    $corsEnabled = isset($data['cors_enabled']) ? (bool)$data['cors_enabled'] : true;
    
    $expiryType = $data['expiry'] ?? 'never';
    $validExpiries = ['never', '1h', '24h', '7d'];
    if (!in_array($expiryType, $validExpiries)) {
        $expiryType = 'never';
    }

    $expiresAt = null;
    if ($expiryType !== 'never') {
        $map = ['1h' => '+1 hour', '24h' => '+24 hours', '7d' => '+7 days'];
        $expiresAt = date('Y-m-d H:i:s', strtotime($map[$expiryType]));
    }

    $db = DB::getConnection();

    // Generate unique 10-char hash via cryptographically secure bytes
    $hash = '';
    $maxTries = 10;
    for ($i = 0; $i < $maxTries; $i++) {
        $hash = bin2hex(random_bytes(5));
        $stmt = $db->prepare("SELECT id FROM mock_endpoints WHERE url_hash = :hash");
        $stmt->execute(['hash' => $hash]);
        if (!$stmt->fetchColumn()) {
            break;
        }
        if ($i === $maxTries - 1) {
            throw new Exception("Hash generation failed");
        }
    }

    $stmt = $db->prepare("
        INSERT INTO mock_endpoints 
        (url_hash, label, json_payload, status_code, delay_ms, cors_enabled, expiry_type, expires_at)
        VALUES 
        (:hash, :label, :payload, :status_code, :delay_ms, :cors, :expiry_type, :expires_at)
    ");

    $stmt->execute([
        'hash' => $hash,
        'label' => $label,
        'payload' => $payload,
        'status_code' => $statusCode,
        'delay_ms' => $delayMs,
        'cors' => (int)$corsEnabled,
        'expiry_type' => $expiryType,
        'expires_at' => $expiresAt
    ]);

    $appUrl = getenv('APP_URL') ?: $_ENV['APP_URL'] ?? 'http://localhost:8000';
    $baseUrl = rtrim($appUrl, '/');

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "hash" => $hash,
        "url" => "{$baseUrl}/api/{$hash}",
        "expires_at" => $expiresAt ? date('c', strtotime($expiresAt)) : null,
        "created_at" => date('c')
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Internal Server Error"]);
}
