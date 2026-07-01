<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['name']) || empty($input['email']) || empty($input['message'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

$dataDir = __DIR__ . '/../assets/data/';
if (!is_dir($dataDir)) mkdir($dataDir, 0755, true);

$messages = [];
$msgFile = $dataDir . 'messages.json';
if (file_exists($msgFile)) {
    $content = file_get_contents($msgFile);
    $messages = json_decode($content, true) ?: [];
}

$messages[] = [
    'id' => uniqid(),
    'name' => substr(strip_tags($input['name']), 0, 100),
    'email' => substr(strip_tags($input['email']), 0, 100),
    'message' => substr(strip_tags($input['message']), 0, 5000),
    'date' => date('Y-m-d H:i:s'),
    'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
    'read' => false
];

file_put_contents($msgFile, json_encode($messages, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode(['success' => true, 'message' => 'Your message has been sent. We will get back to you soon.']);
