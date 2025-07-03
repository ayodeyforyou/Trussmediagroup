<?php
// admin_blog_edit.php
require 'admin_session.php';
require 'Database.php';
$db = new Database();
$error = '';
$id = $_GET['id'] ?? null;
if (!$id) { header('Location: admin_dashboard.php'); exit; }
$stmt = $db->pdo->prepare('SELECT * FROM blogs WHERE id = ?');
$stmt->execute([$id]);
$blog = $stmt->fetch();
if (!$blog) { header('Location: admin_dashboard.php'); exit; }
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = trim($_POST['title'] ?? '');
    $content = trim($_POST['content'] ?? '');
    $image = trim($_POST['image'] ?? '');
    $status = $_POST['status'] ?? 'published';
    if ($title && $content) {
        $stmt = $db->pdo->prepare('UPDATE blogs SET title=?, content=?, image=?, status=? WHERE id=?');
        $stmt->execute([$title, $content, $image, $status, $id]);
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
    <title>Edit Blog Post</title>
    <style>body{font-family:sans-serif;background:#f7f7f7;}form{max-width:600px;margin:2em auto;padding:2em;background:#fff;border-radius:8px;box-shadow:0 2px 8px #0001;}input,textarea,select{width:100%;padding:0.7em;margin-bottom:1em;}button{padding:0.7em 2em;background:#d4af37;color:#fff;border:none;border-radius:4px;font-weight:bold;}h2{text-align:center;}a{color:#d4af37;}</style>
</head>
<body>
    <form method="POST">
        <h2>Edit Blog Post</h2>
        <?php if ($error) echo '<p style="color:red;">'.$error.'</p>'; ?>
        <input type="text" name="title" value="<?php echo htmlspecialchars($blog['title']); ?>" required>
        <textarea name="content" rows="10" required><?php echo htmlspecialchars($blog['content']); ?></textarea>
        <input type="text" name="image" value="<?php echo htmlspecialchars($blog['image']); ?>" placeholder="Image URL (optional)">
        <select name="status">
            <option value="published"<?php if($blog['status']==='published') echo ' selected'; ?>>Published</option>
            <option value="draft"<?php if($blog['status']==='draft') echo ' selected'; ?>>Draft</option>
        </select>
        <button type="submit">Update Post</button>
        <a href="admin_dashboard.php">Cancel</a>
    </form>
</body>
</html>
