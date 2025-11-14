<?php
require_once 'config.php';
# header('Content-Type: application/json');

if (isset($_POST["submit"])) {

	require_once 'func.php';

	login($client, $_POST['user'],$_POST['senha']);

} else {
	header("location: ../?error=submit");
	exit();
}
