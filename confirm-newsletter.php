<?php
// confirm-newsletter.php
require 'config.php';
require 'EmailHandler.php';

if (isset($_GET['email'])) {
    $email = $_GET['email'];
    $mailer = new EmailHandler($config);
    if ($mailer->confirmNewsletter($email)) {
        echo "Your subscription has been confirmed! Thank you.";
    } else {
        echo "Confirmation failed or already confirmed.";
    }
} else {
    echo "Invalid confirmation link.";
}
