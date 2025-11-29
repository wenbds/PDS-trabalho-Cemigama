<?php
require_once '../db/config.php';

$pedido = json_decode(file_get_contents('php://input', true));
$resposta = $pedido->quero ?? null;

switch ($resposta) {
	case 0:
	$resposta = $client->util->produto;
	break;
	case 1:
	$resposta = $client->util->venda;
	break;
	case 2:
	$resposta = $client->util->cliente;
	break;

	default:
	$resposta = 'inválido';
}

if (is_string($resposta)) {
	echo json_encode(['msg' => $resposta]);
	die();
}

$resposta = $resposta->find([]);
$eco = [];
foreach ($resposta as $doc) {
	$eco[] = $doc;
}

echo json_encode($eco);
