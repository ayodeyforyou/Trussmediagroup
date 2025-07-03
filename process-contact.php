<?php
// process-contact.php
$config = require 'config.php';
require 'EmailHandler.php';
require 'Database.php';

function sanitize($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = sanitize($_POST['name'] ?? '');
    $email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $message = sanitize($_POST['message'] ?? '');
    $subject = sanitize($_POST['subject'] ?? 'Media Inquiry');
    $company = sanitize($_POST['company'] ?? '');
    $inquiry_type = sanitize($_POST['inquiry_type'] ?? '');
    $phone = sanitize($_POST['phone'] ?? '');

    if (!$name || !$email || !$message) {
        http_response_code(400);
        echo "All fields are required and email must be valid.";
        exit;
    }

    $body = "
        <div style=\"font-family: Ubuntu, Arial, sans-serif; color: #222;\">
            <h2 style=\"color: #d4af37;\">New Media Inquiry</h2>
            <p><strong>Name:</strong> {$name}</p>
            <p><strong>Email:</strong> {$email}</p>
            <p><strong>Company:</strong> {$company}</p>
            <p><strong>Inquiry Type:</strong> {$inquiry_type}</p>
            <p><strong>Phone:</strong> {$phone}</p>
            <p><strong>Message:</strong><br>" . nl2br($message) . "</p>
            <hr>
            <small>Truss Media Group | Media Inquiries</small>
        </div>
    ";

    $mailer = new EmailHandler($config);
    // Save to DB
    $contactId = $mailer->saveContact([
        'name' => $name,
        'email' => $email,
        'company' => $company,
        'inquiry_type' => $inquiry_type,
        'message' => $message,
        'phone' => $phone,
        'status' => 'new'
    ]);

    $sent = $mailer->sendMail(
        $config['admin_email'],
        'Media Team',
        $subject,
        $body,
        "Name: $name\nEmail: $email\nCompany: $company\nInquiry Type: $inquiry_type\nPhone: $phone\nMessage:\n$message"
    );

    if ($sent) {
        echo "Thank you for contacting us. We will respond soon.";
    } else {
        http_response_code(500);
        echo "Failed to send your message. Please try again later.";
    }
} else {
    http_response_code(405);
    echo "Method not allowed.";
}
