<?php
// process-newsletter.php
$config = require 'config.php';
require 'EmailHandler.php';
require 'Database.php';

function sanitize($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $name = sanitize($_POST['name'] ?? '');
    $interests = sanitize($_POST['interests'] ?? '');

    if (!$email) {
        http_response_code(400);
        echo "Please enter a valid email address.";
        exit;
    }

    $mailer = new EmailHandler($config);
    $result = $mailer->saveNewsletter([
        'email' => $email,
        'name' => $name,
        'interests' => $interests,
        'status' => 'pending',
        'confirmed' => 0
    ]);

    if ($result === 'duplicate') {
        echo "You are already subscribed to our newsletter.";
        exit;
    }

    if ($result) {
        echo "Thank you for subscribing! Please check your email to confirm your subscription.";
    } else {
        http_response_code(500);
        echo "Failed to subscribe. Please try again later.";
    }
} else {
    http_response_code(405);
    echo "Method not allowed.";
}
