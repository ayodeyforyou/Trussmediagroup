<?php
// admin_dashboard.php
require 'admin_session.php';
require 'Database.php';
$db = new Database();
// Fetch data
$contacts = $db->pdo->query('SELECT * FROM media_contacts ORDER BY timestamp DESC')->fetchAll();
$subscribers = $db->pdo->query('SELECT * FROM newsletter_subscribers ORDER BY signup_date DESC')->fetchAll();
$inquiries = $db->pdo->query('SELECT i.*, c.name, c.email FROM media_inquiries i JOIN media_contacts c ON i.contact_id = c.id ORDER BY i.id DESC')->fetchAll();
// Fetch blogs
$blogs = $db->pdo->query('SELECT * FROM blogs ORDER BY created_at DESC')->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin Dashboard - Truss Media Group</title>
    <style>body{font-family:sans-serif;background:#f7f7f7;}h2{margin-top:2em;}table{width:100%;border-collapse:collapse;margin-bottom:2em;}th,td{border:1px solid #ccc;padding:0.5em;}th{background:#d4af37;color:#fff;}tr:nth-child(even){background:#faf8f2;}nav{text-align:right;margin:1em 0;}a.button{background:#d4af37;color:#fff;padding:0.5em 1em;border-radius:4px;text-decoration:none;}</style>
</head>
<body>
<nav>
    <span>Welcome, <?php echo htmlspecialchars($_SESSION['admin_username']); ?></span>
    <a href="../index.html" class="button" style="background:#888;">Back to Site</a>
    <a href="admin_logout.php" class="button">Logout</a>
</nav>
<h1>Admin Dashboard</h1>
<h2>Media Contacts</h2>
<table><tr><th>ID</th><th>Name</th><th>Email</th><th>Company</th><th>Inquiry Type</th><th>Phone</th><th>Status</th><th>Timestamp</th></tr>
<?php foreach ($contacts as $c): ?>
<tr><td><?php echo $c['id']; ?></td><td><?php echo htmlspecialchars($c['name']); ?></td><td><?php echo htmlspecialchars($c['email']); ?></td><td><?php echo htmlspecialchars($c['company']); ?></td><td><?php echo htmlspecialchars($c['inquiry_type']); ?></td><td><?php echo htmlspecialchars($c['phone']); ?></td><td><?php echo htmlspecialchars($c['status']); ?></td><td><?php echo $c['timestamp']; ?></td></tr>
<?php endforeach; ?>
</table>
<h2>Newsletter Subscribers</h2>
<table><tr><th>ID</th><th>Email</th><th>Name</th><th>Interests</th><th>Status</th><th>Confirmed</th><th>Signup Date</th></tr>
<?php foreach ($subscribers as $s): ?>
<tr><td><?php echo $s['id']; ?></td><td><?php echo htmlspecialchars($s['email']); ?></td><td><?php echo htmlspecialchars($s['name']); ?></td><td><?php echo htmlspecialchars($s['interests']); ?></td><td><?php echo htmlspecialchars($s['status']); ?></td><td><?php echo $s['confirmed'] ? 'Yes' : 'No'; ?></td><td><?php echo $s['signup_date']; ?></td></tr>
<?php endforeach; ?>
</table>
<h2>Media Inquiries</h2>
<table><tr><th>ID</th><th>Contact Name</th><th>Email</th><th>Inquiry Type</th><th>Priority</th><th>Status</th></tr>
<?php foreach ($inquiries as $i): ?>
<tr><td><?php echo $i['id']; ?></td><td><?php echo htmlspecialchars($i['name']); ?></td><td><?php echo htmlspecialchars($i['email']); ?></td><td><?php echo htmlspecialchars($i['inquiry_type']); ?></td><td><?php echo htmlspecialchars($i['priority']); ?></td><td><?php echo htmlspecialchars($i['status']); ?></td></tr>
<?php endforeach; ?>
</table>
<!-- Blog Management -->
<h2>Blog Management</h2>
<a href="admin_blog_create.php" class="button" style="margin-bottom:1em;">Add New Blog Post</a>
<table><tr><th>ID</th><th>Title</th><th>Author</th><th>Status</th><th>Created</th><th>Actions</th></tr>
<?php foreach ($blogs as $b): ?>
<tr>
    <td><?php echo $b['id']; ?></td>
    <td><?php echo htmlspecialchars($b['title']); ?></td>
    <td><?php echo htmlspecialchars($b['author']); ?></td>
    <td><?php echo htmlspecialchars($b['status']); ?></td>
    <td><?php echo $b['created_at']; ?></td>
    <td>
        <a href="admin_blog_edit.php?id=<?php echo $b['id']; ?>" class="button" style="background:#888;">Edit</a>
        <a href="admin_blog_delete.php?id=<?php echo $b['id']; ?>" class="button" style="background:#c00;" onclick="return confirm('Delete this post?');">Delete</a>
    </td>
</tr>
<?php endforeach; ?>
</table>
</body>
</html>
