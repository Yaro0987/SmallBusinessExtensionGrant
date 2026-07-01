<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$dataDir = __DIR__ . '/../../assets/data/';
if (!is_dir($dataDir)) mkdir($dataDir, 0755, true);

$type = isset($_GET['type']) ? preg_replace('/[^a-z0-9_-]/', '', $_GET['type']) : '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!$type) { http_response_code(400); echo json_encode(['success' => false, 'message' => 'Missing type parameter']); exit; }
    $file = $dataDir . $type . '.json';
    if (!file_exists($file)) { echo json_encode(['success' => true, 'data' => []]); exit; }
    $content = file_get_contents($file);
    $decoded = json_decode($content, true);
    echo json_encode(['success' => true, 'data' => $decoded ?: []]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['type']) || !isset($input['data'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid request: type and data required']);
        exit;
    }
    $saveType = preg_replace('/[^a-z0-9_-]/', '', $input['type']);
    $file = $dataDir . $saveType . '.json';
    file_put_contents($file, json_encode($input['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    echo json_encode(['success' => true, 'message' => 'Saved successfully']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
