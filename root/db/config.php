<?php
require_once '../../vendor/autoload.php';

# TODO@FEAT Trocar o URI para uma variável do arquivo ENV
$uri = 'mongodb+srv://common:0KabjjWI8g-KLo6p3e%5E5%C3%A75nNMp.b59nqrfp%C3%A7rxc%7Ez%C3%A7ad%C3%A7eron.qwr@planedecor.srrjxug.mongodb.net/?appName=planedecor';
$client = new MongoDB\Client($uri);

if (!$client) {
	die("Faleci");
}
