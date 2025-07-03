<?php
// Database.php - PDO connection and operations for Truss Media Group
class Database {
    private $host = 'localhost';
    private $db   = 'trussmedia'; // Change to your DB name
    private $user = 'root'; // Change to your DB user
    private $pass = '';
    private $charset = 'utf8mb4';
    public $pdo;

    public function __construct() {
        $dsn = "mysql:host={$this->host};dbname={$this->db};charset={$this->charset}";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $this->pdo = new PDO($dsn, $this->user, $this->pass, $options);
        } catch (PDOException $e) {
            throw new Exception('Database connection failed: ' . $e->getMessage());
        }
    }

    // Insert contact
    public function insertContact($data) {
        $stmt = $this->pdo->prepare("INSERT INTO media_contacts (name, email, company, inquiry_type, message, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['name'], $data['email'], $data['company'], $data['inquiry_type'], $data['message'], $data['phone'], $data['status'] ?? 'new'
        ]);
        return $this->pdo->lastInsertId();
    }

    // Insert newsletter subscriber (prevent duplicate)
    public function insertNewsletter($data) {
        $stmt = $this->pdo->prepare("SELECT id FROM newsletter_subscribers WHERE email = ?");
        $stmt->execute([$data['email']]);
        if ($stmt->fetch()) return false;
        $stmt = $this->pdo->prepare("INSERT INTO newsletter_subscribers (email, name, interests, status, confirmed) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['email'], $data['name'], $data['interests'], $data['status'] ?? 'pending', $data['confirmed'] ?? 0
        ]);
        return $this->pdo->lastInsertId();
    }

    // Confirm newsletter subscriber
    public function confirmNewsletter($email) {
        $stmt = $this->pdo->prepare("UPDATE newsletter_subscribers SET confirmed = 1, status = 'active' WHERE email = ?");
        return $stmt->execute([$email]);
    }

    // Insert media inquiry
    public function insertInquiry($data) {
        $stmt = $this->pdo->prepare("INSERT INTO media_inquiries (contact_id, inquiry_type, priority, status) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $data['contact_id'], $data['inquiry_type'], $data['priority'] ?? 'normal', $data['status'] ?? 'open'
        ]);
        return $this->pdo->lastInsertId();
    }
}
?>
