<?php
// config.php
return [
    'smtp_host' => 'smtp.gmail.com',
    'smtp_port' => 587,
    'smtp_user' => 'your_gmail_address@gmail.com',
    'smtp_pass' => 'your_app_password', // Use Gmail App Password, not your main password!
    'smtp_secure' => 'tls',
    'from_email' => 'your_gmail_address@gmail.com',
    'from_name' => 'Truss Media Group',
    'admin_email' => 'media@yourdomain.com', // Where contact form notifications go

    // Database
    'db_host' => 'localhost',
    'db_name' => 'trussmedia',
    'db_user' => 'root',
    'db_pass' => '',
];
