<?php
require_once 'config.php';
# header('Content-Type: application/json');

if (isset($_POST["submit"])) {

	require_once 'func.php';

	logout($client);

} else {
	header("location: ../main/?error=submit");
	exit();
}
