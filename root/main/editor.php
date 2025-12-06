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
	['produto','valor','data','nome','cliente','quant'],
	['nome','endereco','cpf-cnpj']
];

$schema = $schemas[$tipo];

if ($resposta == 'w') {
	$dados = $pedido['dados'] ?? [];
	$x = [];
	foreach ($schema as $y) {
		if ($y === '_id') continue;
		if (gettype($dados[$y])==='array') {
			if (array_key_exists('oid',$dados[$y])) {
				$x[$y] = new MongoDB\BSON\ObjectId($dados[$y]['oid']);
				continue;
			} else if (array_key_exists('date',$dados[$y])) {
				$x[$y] = new MongoDB\BSON\UTCDateTime((int) $dados[$y]['milliseconds']);
				continue;
			}
		}
		$x[$y] = $dados[$y];
	}
	print('Var dump of x:');
	var_dump($x);
	try {$resposta = $b->insertOne($x);}
	catch (\Exception $e) {
		print_r($e);
		exit();
	}
} else if ($resposta == 'wv') {
	$varia = $pedido['var'];
	if (!$varia) {
		print_r('Sem nome da variável. Cancelando o procedimento por segurança.');
		exit();
	}
	$value = $pedido['val'];
	if (!$value) {
		print_r('Sem valor da variável. Cancelando o procedimento por segurança.');
		exit();
	}
	try {$resposta = $a->variaveis->updateOne(
		['_id' => $varia],
		['$set' => ['val' => $value]]);}
	catch (\Exception $e) {
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
		print_r($e);
		exit();
	}
} else if ($resposta == 'u') {
	$objeto = $pedido['id'];
	if (!$objeto) {
		print_r('Sem ID do objeto. Cancelando o procedimento por segurança.');
		exit();
	}
	$dados = $pedido['dados'];
	if (!$dados) {
		print_r('Sem dados. Cancelando o procedimento por segurança.');
		exit();
	}
	$x = [];
	foreach ($schema as $y) {
		if ($dados[$y] === null || $y === '_id') continue;
		if (gettype($dados[$y])==='array') {
			if (array_key_exists('oid',$dados[$y])) {
				$x[$y] = new MongoDB\BSON\ObjectId($dados[$y]['oid']);
				continue;
			} else if (array_key_exists('date',$dados[$y])) {
				$x[$y] = new MongoDB\BSON\UTCDateTime((int) $dados[$y]['milliseconds']);
				continue;
			}
		}
		
		$x[$y] = $dados[$y];
	}
	#print('Var dump of x:');
	#var_dump($x);
	$objeto = new MongoDB\BSON\ObjectId($objeto);
	try {$resposta = $b->updateOne(
		['_id' => $objeto],
		['$set' => $x]);}
	catch (\Exception $e) {
		print_r($e);
		exit();
	}
}

echo json_encode($resposta);
