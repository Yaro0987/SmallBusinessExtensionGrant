<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'Method not allowed']); exit; }

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['fullname'])) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'Invalid submission data']); exit; }

// Get app prefix from settings
$appPrefix = 'sbg';
$settingsFile = __DIR__ . '/../assets/data/settings.json';
if (file_exists($settingsFile)) {
    $s = json_decode(file_get_contents($settingsFile), true);
    if ($s && isset($s['general']['app_prefix'])) $appPrefix = $s['general']['app_prefix'];
}

$appId = $appPrefix . '-' . strtoupper(substr(bin2hex(random_bytes(5)), 0, 10));

// Save submission
$logDir = __DIR__ . '/../assets/uploads/submissions/';
if (!is_dir($logDir)) mkdir($logDir, 0755, true);

$entry = [
    'appId' => $appId,
    'timestamp' => date('Y-m-d H:i:s'),
    'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
    'status' => 'pending',
    'data' => $input
];

$filename = 'submission_' . date('Ymd_His') . '_' . substr(md5(uniqid()), 0, 8) . '.json';
file_put_contents($logDir . $filename, json_encode($entry, JSON_PRETTY_PRINT));

// Save to data/application.json for tracking
$appFile = __DIR__ . '/../data/application.json';
$apps = [];
if (file_exists($appFile)) $apps = json_decode(file_get_contents($appFile), true) ?: [];
if (!isset($apps['recent_submissions'])) $apps['recent_submissions'] = [];
array_unshift($apps['recent_submissions'], [
    'appId' => $appId,
    'fullname' => $input['fullname'] ?? '',
    'business' => $input['business_name'] ?? '',
    'grant_type' => $input['grant_type'] ?? '',
    'amount' => $input['grant_amount'] ?? '',
    'status' => 'pending',
    'submitted' => date('Y-m-d'),
    'email' => $input['email'] ?? '',
    'phone' => $input['cell'] ?? ''
]);
$apps['total_submissions'] = ($apps['total_submissions'] ?? 0) + 1;
$apps['pending_review'] = ($apps['pending_review'] ?? 0) + 1;
file_put_contents($appFile, json_encode($apps, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

// Save user to data/user.json
$userFile = __DIR__ . '/../data/user.json';
$users = [];
if (file_exists($userFile)) $users = json_decode(file_get_contents($userFile), true) ?: [];
$users[] = [
    'id' => count($users) + 1,
    'appId' => $appId,
    'fullname' => $input['fullname'] ?? '',
    'email' => $input['email'] ?? '',
    'phone' => $input['cell'] ?? '',
    'business' => $input['business_name'] ?? '',
    'grant_type' => $input['grant_type'] ?? '',
    'amount_requested' => intval($input['grant_amount'] ?? 0),
    'status' => 'pending',
    'applied_date' => date('Y-m-d'),
    'notes' => ''
];
file_put_contents($userFile, json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

// Trigger emails
$mailerUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']) . '/mailer.php';

// User notification
$ch = curl_init($mailerUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['type'=>'submission_user','data'=>array_merge($input,['appId'=>$appId])]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_exec($ch);
curl_close($ch);

// Admin notification
$ch2 = curl_init($mailerUrl);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_POST, true);
curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode(['type'=>'submission_admin','data'=>array_merge($input,['appId'=>$appId])]));
curl_setopt($ch2, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch2, CURLOPT_TIMEOUT, 5);
curl_exec($ch2);
curl_close($ch2);

echo json_encode(['success'=>true, 'message'=>'Application received. Your ID: '.$appId.'. We will review within 24 hours.', 'appId'=>$appId, 'id'=>$filename]);
