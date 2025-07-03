<?php
// EmailHandler.php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php'; // Make sure PHPMailer is installed via Composer
require_once 'Database.php';

class EmailHandler {
    private $config;
    private $db;
    public function __construct($config) {
        $this->config = $config;
        $this->db = new Database();
    }
    public function sendMail($to, $toName, $subject, $body, $altBody = '') {
        $mail = new PHPMailer(true);
        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host = $this->config['smtp_host'];
            $mail->SMTPAuth = true;
            $mail->Username = $this->config['smtp_user'];
            $mail->Password = $this->config['smtp_pass'];
            $mail->SMTPSecure = $this->config['smtp_secure'];
            $mail->Port = $this->config['smtp_port'];

            // Recipients
            $mail->setFrom($this->config['from_email'], $this->config['from_name']);
            $mail->addAddress($to, $toName);

            // Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $body;
            $mail->AltBody = $altBody;

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log('Mailer Error: ' . $mail->ErrorInfo);
            return false;
        }
    }

    // Store contact and inquiry
    public function saveContact($data) {
        $contactId = $this->db->insertContact($data);
        if (!empty($data['inquiry_type'])) {
            $this->db->insertInquiry([
                'contact_id' => $contactId,
                'inquiry_type' => $data['inquiry_type'],
                'priority' => $data['priority'] ?? 'normal',
                'status' => 'open'
            ]);
        }
        return $contactId;
    }

    // Store newsletter subscriber, prevent duplicate, send confirmation
    public function saveNewsletter($data) {
        $subscriberId = $this->db->insertNewsletter($data);
        if ($subscriberId === false) {
            return 'duplicate';
        }
        // Send confirmation email
        $token = bin2hex(random_bytes(16));
        $confirmUrl = "https://" . $_SERVER['HTTP_HOST'] . "/confirm-newsletter.php?email=" . urlencode($data['email']) . "&token=$token";
        $subject = "Confirm your subscription";
        $body = "<p>Thank you for subscribing! Please <a href='$confirmUrl'>confirm your email</a> to activate your subscription.</p>";
        $this->sendMail($data['email'], $data['name'] ?? '', $subject, $body);
        // Optionally store token in DB for validation (not shown here)
        return $subscriberId;
    }

    public function confirmNewsletter($email) {
        return $this->db->confirmNewsletter($email);
    }
}
