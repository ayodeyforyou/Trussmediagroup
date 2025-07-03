<?php
require_once '../Database.php';
require_once 'media-session.php';
$db = new Database();
// Fetch categorized inquiries
$inquiries = $db->pdo->query('SELECT * FROM media_contacts ORDER BY timestamp DESC')->fetchAll();
$stats = [
  'total' => count($inquiries),
  'press' => 0,
  'collaboration' => 0,
  'interview' => 0,
  'urgent' => 0
];
foreach ($inquiries as $inq) {
  $type = strtolower($inq['inquiry_type']);
  if (strpos($type, 'press') !== false) $stats['press']++;
  if (strpos($type, 'collab') !== false) $stats['collaboration']++;
  if (strpos($type, 'interview') !== false) $stats['interview']++;
  if (strtolower($inq['status']) === 'urgent') $stats['urgent']++;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Media Admin Dashboard</title>
  <link rel="stylesheet" href="media-admin.css">
  <style>@media (max-width:700px){.stats{flex-direction:column;gap:1em;}}</style>
</head>
<body>
<nav class="admin-nav">
  <span>Media Admin</span>
  <a href="media-dashboard.php">Dashboard</a>
  <a href="media-contacts.php">Contacts</a>
  <a href="newsletter-media.php">Newsletter</a>
  <a href="export-media.php">Export</a>
  <a href="media-logout.php">Logout</a>
</nav>
<main>
  <h1>Media Communications Dashboard</h1>
  <div class="stats" style="display:flex;gap:2em;margin:2em 0;">
    <div class="stat-box"><span class="stat-num"><?php echo $stats['total']; ?></span><span>Total Inquiries</span></div>
    <div class="stat-box"><span class="stat-num"><?php echo $stats['press']; ?></span><span>Press</span></div>
    <div class="stat-box"><span class="stat-num"><?php echo $stats['collaboration']; ?></span><span>Collaboration</span></div>
    <div class="stat-box"><span class="stat-num"><?php echo $stats['interview']; ?></span><span>Interview</span></div>
    <div class="stat-box urgent"><span class="stat-num"><?php echo $stats['urgent']; ?></span><span>Urgent</span></div>
  </div>
  <section>
    <h2>Recent Media Inquiries</h2>
    <table class="media-table">
      <tr><th>Name</th><th>Email</th><th>Type</th><th>Company</th><th>Status</th><th>Received</th><th>Action</th></tr>
      <?php foreach(array_slice($inquiries,0,10) as $inq): ?>
      <tr class="<?php echo strtolower($inq['status'])==='urgent'?'urgent-row':''; ?>">
        <td><?php echo htmlspecialchars($inq['name']); ?></td>
        <td><?php echo htmlspecialchars($inq['email']); ?></td>
        <td><?php echo htmlspecialchars($inq['inquiry_type']); ?></td>
        <td><?php echo htmlspecialchars($inq['company']); ?></td>
        <td><?php echo htmlspecialchars($inq['status']); ?></td>
        <td><?php echo $inq['timestamp']; ?></td>
        <td><a href="media-contacts.php?id=<?php echo $inq['id']; ?>">View</a></td>
      </tr>
      <?php endforeach; ?>
    </table>
  </section>
</main>
</body>
</html>
