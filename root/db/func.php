<?php
# -- Funções comuns usadas no PHP p/ manipulação de banco de dados --

function err ($context) {
	header("location: ../?error=".$context);
	exit();
}

function userExiste ($client, $user, $senha) {
	$users = $client->basic->user;
	if (!$users) { err("estrutura"); }
	$cursor = $users->findOne(['nome' => $user, 'senha' => $senha]);
	if ($cursor === null) { err("results"); }

	return true;
}

# Log-in
function login ($client, $user, $senha) {
	$existe = userExiste($client, $user, $senha);
	if ($existe === false) {
		err('invalid');
	}

	session_start();
	$_SESSION["session"] = 1;
	header("location: ../main/");
	exit();
}

function logout ($client) {
	if (ini_get("session.use_cookies")) {
	    $params = session_get_cookie_params();
	    setcookie(session_name(), '', time() - 42000,
		  $params["path"], $params["domain"],
		  $params["secure"], $params["httponly"]
		);
	}
	session_destroy();
	header("location: ../?end=true");
	exit();
}
