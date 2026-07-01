<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'Method not allowed']); exit; }

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'Invalid input']); exit; }

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$subject = trim($input['subject'] ?? '');
$message = trim($input['message'] ?? '');

if (!$name || !$email || !$subject || !$message) {
    http_response_code(400);
    echo json_encode(['success'=>false,'message'=>'All fields are required']);
    exit;
}

$logFile = __DIR__ . '/../assets/data/support.json';
$tickets = [];
if (file_exists($logFile)) $tickets = json_decode(file_get_contents($logFile), true) ?: [];

$ticket = [
    'id' => count($tickets) + 1,
    'name' => $name,
    'email' => $email,
    'subject' => $subject,
    'message' => $message,
    'status' => 'open',
    'date' => date('Y-m-d'),
    'admin_response' => ''
];

$tickets[] = $ticket;
file_put_contents($logFile, json_encode($tickets, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode(['success'=>true, 'message'=>'Support request submitted successfully. We will get back to you shortly.', 'ticket'=>['id'=>$ticket['id']]]);
