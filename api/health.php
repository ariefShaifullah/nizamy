<?php
/**
 * NIZAMY — Health Check
 */
header('Content-Type: application/json');
header('Cache-Control: no-cache');
echo json_encode(['status' => 'ok', 'time' => date('c')]);
