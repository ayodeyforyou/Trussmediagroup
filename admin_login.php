<?php
// admin_login.php
require 'Database.php';
session_start();
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    if ($username && $password) {
        $db = new Database();
        $stmt = $db->pdo->prepare('SELECT * FROM admins WHERE username = ? AND status = "active" LIMIT 1');
        $stmt->execute([$username]);
        $admin = $stmt->fetch();
        if ($admin && password_verify($password, $admin['password_hash'])) {
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_username'] = $admin['username'];
            header('Location: admin_dashboard.php');
            exit;
        } else {
            $error = 'Invalid username or password.';
        }
    } else {
        $error = 'Please enter both username and password.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin Login - Truss Media Group</title>
    <style>body{font-family:sans-serif;background:#f7f7f7;}form{max-width:350px;margin:5em auto;padding:2em;background:#fff;border-radius:8px;box-shadow:0 2px 8px #0001;}input{width:100%;padding:0.7em;margin-bottom:1em;}button{width:100%;padding:0.7em;background:#d4af37;color:#fff;border:none;border-radius:4px;font-weight:bold;}h2{text-align:center;}p.error{color:red;text-align:center;}</style>
</head>
<body>
    <form method="POST" autocomplete="off">
        <h2>Admin Login</h2>
        <?php if ($error) echo '<p class="error">'.$error.'</p>'; ?>
        <input type="text" name="username" placeholder="Username" required autofocus>
        <input type="password" name="password" placeholder="Password" required>
        <button type="submit">Login</button>
    </form>
</body>
</html>
