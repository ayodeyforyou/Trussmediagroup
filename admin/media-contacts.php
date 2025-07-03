<?php
// admin/media-contacts.php
require_once '../admin_session.php';
require_once '../Database.php';

$db = new Database();
$filter = $_GET['type'] ?? '';
$priority = $_GET['priority'] ?? '';

// Fetch media inquiries with optional filters
$query = "SELECT * FROM media_inquiries WHERE 1=1";
$params = [];
if ($filter) {
    $query .= " AND inquiry_type = ?";
    $params[] = $filter;
}
if ($priority) {
    $query .= " AND priority = ?";
    $params[] = $priority;
}
$query .= " ORDER BY created_at DESC";
$inquiries = $db->fetchAll($query, $params);

// For response templates
$response_templates = [
    'press' => 'Thank you for your press inquiry. Our team will respond shortly.',
    'collaboration' => 'Thank you for your interest in collaborating. We will review and get back to you.',
    'interview' => 'Thank you for your interview request. We will contact you to schedule.'
];

function h($str) { return htmlspecialchars($str, ENT_QUOTES, 'UTF-8'); }
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Media Contacts | Admin</title>
    <link rel="stylesheet" href="../style.css">
    <style>
        body { background: #181818; color: #fff; font-family: 'Segoe UI', Arial, sans-serif; }
        .admin-container { max-width: 1100px; margin: 2rem auto; background: #232323; border-radius: 12px; box-shadow: 0 2px 12px #0003; padding: 2rem; }
        h1 { color: #d4af37; }
        .filter-bar { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .filter-bar select, .filter-bar button { padding: 0.5em 1em; border-radius: 6px; border: none; background: #222; color: #fff; }
        .contacts-table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
        .contacts-table th, .contacts-table td { padding: 0.7em 0.5em; border-bottom: 1px solid #333; }
        .contacts-table th { background: #191919; color: #d4af37; }
        .priority-high { color: #fff; background: #d32f2f; border-radius: 4px; padding: 0.2em 0.6em; font-weight: bold; }
        .priority-normal { color: #fff; background: #388e3c; border-radius: 4px; padding: 0.2em 0.6em; }
        .response-template { font-size: 0.95em; color: #d4af37; margin-top: 0.5em; }
        @media (max-width: 700px) {
            .admin-container { padding: 0.5rem; }
            .contacts-table, .contacts-table th, .contacts-table td { font-size: 0.95em; }
        }
    </style>
</head>
<body>
<div class="admin-container">
    <h1>Media Contact Submissions</h1>
    <div class="filter-bar">
        <form method="get" style="display:inline-flex;gap:0.5em;align-items:center;">
            <label for="type">Type:</label>
            <select name="type" id="type">
                <option value="">All</option>
                <option value="press"<?= $filter==='press'?' selected':''; ?>>Press</option>
                <option value="collaboration"<?= $filter==='collaboration'?' selected':''; ?>>Collaboration</option>
                <option value="interview"<?= $filter==='interview'?' selected':''; ?>>Interview</option>
            </select>
            <label for="priority">Priority:</label>
            <select name="priority" id="priority">
                <option value="">All</option>
                <option value="high"<?= $priority==='high'?' selected':''; ?>>High</option>
                <option value="normal"<?= $priority==='normal'?' selected':''; ?>>Normal</option>
            </select>
            <button type="submit">Filter</button>
        </form>
        <form method="post" action="export-media.php" style="margin-left:auto;">
            <button type="submit" name="export" value="contacts">Export Contacts</button>
        </form>
    </div>
    <table class="contacts-table">
        <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Message</th>
                <th>Date</th>
                <th>Response Template</th>
            </tr>
        </thead>
        <tbody>
        <?php foreach ($inquiries as $inq): ?>
            <tr>
                <td><?= h($inq['name']) ?></td>
                <td><a href="mailto:<?= h($inq['email']) ?>" style="color:#d4af37;"><?= h($inq['email']) ?></a></td>
                <td><?= h(ucfirst($inq['inquiry_type'])) ?></td>
                <td>
                    <?php if ($inq['priority']==='high'): ?>
                        <span class="priority-high">High</span>
                    <?php else: ?>
                        <span class="priority-normal">Normal</span>
                    <?php endif; ?>
                </td>
                <td><?= nl2br(h($inq['message'])) ?></td>
                <td><?= h(date('M d, Y H:i', strtotime($inq['created_at']))) ?></td>
                <td>
                    <div class="response-template">
                        <?= $response_templates[$inq['inquiry_type']] ?? '—' ?>
                    </div>
                </td>
            </tr>
        <?php endforeach; ?>
        <?php if (empty($inquiries)): ?>
            <tr><td colspan="7" style="text-align:center;color:#aaa;">No inquiries found.</td></tr>
        <?php endif; ?>
        </tbody>
    </table>
    <a href="media-dashboard.php" class="btn btn--secondary">&larr; Back to Dashboard</a>
</div>
</body>
</html>
