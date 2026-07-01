<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'Method not allowed']); exit; }

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['type'])) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'Missing type']); exit; }

$type = $input['type'];
$data = $input['data'] ?? [];
$adminEmail = 'admin@sbgrant.com';

// Load settings for admin email
$settingsFile = __DIR__ . '/../assets/data/settings.json';
if (file_exists($settingsFile)) {
    $settings = json_decode(file_get_contents($settingsFile), true);
    if ($settings && isset($settings['email']['admin_email'])) $adminEmail = $settings['email']['admin_email'];
}

// Read app prefix from settings
$appPrefix = 'sbg';
if (isset($settings['general']['app_prefix']) && $settings['general']['app_prefix']) {
    $appPrefix = $settings['general']['app_prefix'];
}

$appId = $data['appId'] ?? ($appPrefix . '-' . strtoupper(substr(md5(uniqid()), 0, 10)));

$subject = '';
$body = '';

switch ($type) {
    case 'admin_login':
        $subject = 'Admin Login Notification - SBG';
        $time = date('Y-m-d H:i:s');
        $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown';
        $ua = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'unknown';
        $body = "<h2>Admin Login Notification</h2><p>An admin login was detected.</p><table border='1' cellpadding='8' style='border-collapse:collapse'><tr><td>Time</td><td>$time</td></tr><tr><td>IP Address</td><td>$ip</td></tr><tr><td>User Agent</td><td>$ua</td></tr></table>";
        break;

    case 'submission_user':
        $name = $data['fullname'] ?? 'Applicant';
        $subject = "Application Received - $appId";
        $body = "<h2>Application Received</h2><p>Dear $name,</p><p>Thank you for submitting your grant application.</p><p><strong>Application ID:</strong> $appId</p><p>You can track your application status at any time using this ID on our website.</p><p>Our team will review your application within 24 hours.</p>";
        break;

    case 'submission_admin':
        $subject = "New Application Submitted - $appId";
        $details = '';
        foreach ($data as $k => $v) {
            if (is_string($v) && $k !== 'files') $details .= "<tr><td><strong>" . ucwords(str_replace('_', ' ', $k)) . "</strong></td><td>" . htmlspecialchars($v) . "</td></tr>";
        }
        $body = "<h2>New Grant Application</h2><p>A new application has been submitted.</p><p><strong>Application ID:</strong> $appId</p><table border='1' cellpadding='8' style='border-collapse:collapse;width:100%'>$details</table>";
        break;

    case 'approved':
        $name = $data['fullname'] ?? 'Applicant';
        $comment = $data['comment'] ?? '';
        $subject = "Application Approved - $appId";
        $body = "<h2>Congratulations! Your Application Has Been Approved</h2><p>Dear $name,</p><p>We are pleased to inform you that your grant application <strong>($appId)</strong> has been <strong style='color:#10b981'>approved</strong>.</p>" . ($comment ? "<p><strong>Admin Comment:</strong><br>$comment</p>" : '') . "<p>Our team will contact you shortly with the next steps.</p>";
        break;

    case 'rejected':
        $name = $data['fullname'] ?? 'Applicant';
        $comment = $data['comment'] ?? '';
        $subject = "Application Update - $appId";
        $body = "<h2>Application Status Update</h2><p>Dear $name,</p><p>After careful review, we regret to inform you that your grant application <strong>($appId)</strong> has been <strong style='color:#ef4444'>declined</strong> at this time.</p>" . ($comment ? "<p><strong>Reason:</strong><br>$comment</p>" : '') . "<p>You are welcome to reapply in the future.</p>";
        break;

    case 'review':
        $name = $data['fullname'] ?? 'Applicant';
        $comment = $data['comment'] ?? '';
        $subject = "Application Under Review - $appId";
        $body = "<h2>Application Status Update</h2><p>Dear $name,</p><p>Your grant application <strong>($appId)</strong> is now <strong style='color:#3b82f6'>under review</strong>.</p><p>Our team is carefully evaluating your submission. We will notify you as soon as a decision has been made.</p>" . ($comment ? "<p><strong>Note:</strong><br>$comment</p>" : '') . "<p>You can track your application status anytime using your Application ID.</p>";
        break;

    case 'notify':
        $name = $data['fullname'] ?? 'Applicant';
        $customSubject = $data['custom_subject'] ?? '';
        $customBody = $data['custom_body'] ?? '';
        $comment = $data['comment'] ?? '';
        if ($customSubject && $customBody) {
            $subject = $customSubject;
            $body = "<h2>Notification Regarding Your Application</h2><p>Dear $name,</p><p>$customBody</p><hr><p style='color:#999;font-size:12px'>Application ID: $appId</p>";
        } else {
            $subject = "Important Update Regarding Your Application - $appId";
            $body = "<h2>Application Notification</h2><p>Dear $name,</p><p>There is an update regarding your grant application <strong>($appId)</strong>.</p>" . ($comment ? "<p>$comment</p>" : '') . "<p>Please log in to your tracking portal for more details.</p>";
        }
        break;

    case 'reminder':
        $name = $data['fullname'] ?? 'Applicant';
        $subject = "Follow-up Reminder - $appId";
        $body = "<h2>Application Follow-up Requested</h2><p>Dear Admin,</p><p><strong>$name</strong> has requested a follow-up regarding application <strong>($appId)</strong>.</p><p>Please review and respond at your earliest convenience.</p>";
        break;

    default:
        http_response_code(400);
        echo json_encode(['success'=>false,'message'=>'Unknown email type']);
        exit;
}

$fullBody = "<!DOCTYPE html><html><head><meta charset='UTF-8'><style>body{font-family:Arial,sans-serif;padding:20px;color:#333}table{width:100%}td{padding:8px;border:1px solid #ddd}h2{color:#0b1d3a}</style></head><body>$body<hr><p style='color:#999;font-size:12px'>Small Business Expansion Grant &bull; $appId</p></body></html>";

// Save to email log
$logDir = __DIR__ . '/../assets/data/';
if (!is_dir($logDir)) mkdir($logDir, 0755, true);
$logFile = $logDir . 'emails.json';
$log = [];
if (file_exists($logFile)) $log = json_decode(file_get_contents($logFile), true) ?: [];
$entry = ['type'=>$type, 'subject'=>$subject, 'to'=>$type === 'submission_admin' || $type === 'reminder' ? $adminEmail : ($data['email']??$adminEmail), 'appId'=>$appId, 'sent_at'=>date('Y-m-d H:i:s')];
$log[] = $entry;
file_put_contents($logFile, json_encode($log, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

// In production, use mail() or SMTP here
// mail($to, $subject, $fullBody, "MIME-Version: 1.0\r\nContent-type: text/html; charset=UTF-8\r\nFrom: $adminEmail");

echo json_encode(['success'=>true, 'message'=>'Email queued: '.$subject, 'appId'=>$appId, 'entry'=>$entry]);
