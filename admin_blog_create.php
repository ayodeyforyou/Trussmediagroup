<?php
// admin_blog_create.php
require 'admin_session.php';
require 'Database.php';
$db = new Database();
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = trim($_POST['title'] ?? '');
    $content = trim($_POST['content'] ?? '');
    $author = $_SESSION['admin_username'];
    $image = trim($_POST['image'] ?? '');
    $status = $_POST['status'] ?? 'published';
    if ($title && $content) {
        $stmt = $db->pdo->prepare('INSERT INTO blogs (title, content, author, image, status) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$title, $content, $author, $image, $status]);
        header('Location: admin_dashboard.php');
        exit;
    } else {
        $error = 'Title and content are required.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Add Blog Post</title>
    <style>body{font-family:sans-serif;background:#f7f7f7;}form{max-width:600px;margin:2em auto;padding:2em;background:#fff;border-radius:8px;box-shadow:0 2px 8px #0001;}input,textarea,select{width:100%;padding:0.7em;margin-bottom:1em;}button{padding:0.7em 2em;background:#d4af37;color:#fff;border:none;border-radius:4px;font-weight:bold;}h2{text-align:center;}a{color:#d4af37;}</style>
</head>
<body>
    <form method="POST">
        <h2>Add Blog Post</h2>
        <?php if ($error) echo '<p style="color:red;">'.$error.'</p>'; ?>
        <input type="text" name="title" placeholder="Title" required>
        <textarea name="content" placeholder="Content" rows="10" required></textarea>
        <input type="text" name="image" placeholder="Image URL (optional)">
        <select name="status">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
        </select>
        <button type="submit">Create Post</button>
        <a href="admin_dashboard.php">Cancel</a>
    </form>
</body>
</html>
