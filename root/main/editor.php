<?php
require_once '../db/config.php';

$pedido = json_decode(file_get_contents('php://input', true), true);
$resposta = $pedido['fazer'] ?? null;

$a = $client->util;
$b;
$tipo = $pedido['tipo'];
if ($tipo < 0 || $tipo > 2) { return; }
#print('Var dump of b:');
#var_dump($b);
switch ($tipo) {
	case 0: $b = $a->produto; break;
	case 1: $b = $a->venda; break;
	case 2: $b = $a->cliente; break;
}
#print('Var dump of b (after change):');
#var_dump($b);

$schemas = [
	['nome','tipo','distribuidora','precoUni','custoUni','estoq','estoqMinimo'],
	['produto','valor','data','cliente'],
	['nome','endereco','cpf-cnpj']
];

$schema = $schemas[$tipo];

if ($resposta == 'w') {
	$dados = $pedido['dados'] ?? [];
	$x = [];
	foreach ($schema as $y) {
		$x[$y] = $dados[$y];
	}
	#print('Var dump of x:');
	#var_dump($x);
	try {$resposta = $b->insertOne($x);}
	catch (\Exception $e) {
		print_r($document);
		print_r($e);
		exit();
	}
} else if ($resposta == 'r') {
	$objeto = $pedido['objeto'] ?? [];
	if (!$objeto['_id']) { exit(); }
	if (!$objeto['_id']['$oid']) { exit(); }

	$objeto = new MongoDB\BSON\ObjectId($objeto['_id']['$oid']);
	try {$resposta = $b->deleteOne(['_id' => $objeto]);}
	catch (\Exception $e) {
		print_r($document);
		print_r($e);
		exit();
	}
} else if ($resposta == 'u') {
	$objeto = $pedido['id'];
	if (!$objeto) {
		print('Sem ID do objeto. Cancelando o procedimento por segurança.');
		print_r($document);
		exit();
	}
	$dados = $pedido['dados'];
	if (!$dados) {
		print('Sem dados. Cancelando o procedimento por segurança.');
		print_r($document);
		exit();
	}
	$x = [];
	foreach ($schema as $y) {
		$x[$y] = $dados[$y];
	}
	#print('Var dump of x:');
	#var_dump($x);
	$objeto = new MongoDB\BSON\ObjectId($objeto);
	try {$resposta = $b->updateOne(
		['_id' => $objeto],
		['$set' => $x]);}
	catch (\Exception $e) {
		print_r($document);
		print_r($e);
		exit();
	}
}

echo json_encode($resposta);
