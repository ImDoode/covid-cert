<?
$request = $_SERVER['REQUEST_URI'];
echo $request;
switch ($request) {
    case '/' :
    case '' : // you can combine the cases '/' and ''
        require __DIR__ . '/views/home.php';
        break;
    case '/create' :
        require __DIR__ . '/views/create.html';
        break;
    case '/generate' :
        require __DIR__ . '/views/generate.php';
        break;
    default:
        http_response_code(404);
        require __DIR__ . '/views/404.php';
        break;
}
?>