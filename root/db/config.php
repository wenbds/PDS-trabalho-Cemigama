<?php
require_once '../../vendor/autoload.php';

# TODO@FEAT Trocar o URI para uma variável do arquivo ENV
# NOTE: Aparentemente quando o MongoDB atualiza, tem de atualizar o link também.
$uri = 'mongodb+srv://common:0KabjjWI8g-KLo6p3e^5ç5nNMp.b59nqrfpçrxc~zçadçeron.qwr@planedecor.srrjxug.mongodb.net/?appName=planedecor';
$client = new MongoDB\Client($uri);

if (!$client) {
	die("Faleci");
}
