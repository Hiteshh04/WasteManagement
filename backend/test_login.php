<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = Illuminate\Http\Request::create('/api/auth/supervisor/login', 'POST', [
    'username' => 'supervisor_1',
    'password' => 'password123'
]);

$controller = $app->make('App\Http\Controllers\Auth\SupervisorAuthController');
$response = $controller->login($request);

echo $response->getContent();
