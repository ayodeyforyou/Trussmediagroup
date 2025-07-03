<?php
// admin_blog_delete.php
require 'admin_session.php';
require 'Database.php';
$db = new Database();
$id = $_GET['id'] ?? null;
if ($id) {
    $stmt = $db->pdo->prepare('DELETE FROM blogs WHERE id = ?');
    $stmt->execute([$id]);
}
header('Location: admin_dashboard.php');
exit;
