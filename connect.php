<?php 
	//$dsn = "mysql:dbname=ibis;host=192.168.1.30";
	$dsn = "mysql:dbname=inventario;host=localhost";
	$user = "root";
	$password = "";
	$errorDbConexion = true;

	try {
		$pdo = new PDO($dsn,$user,$password);
		$errorDbConexion = false;
	}
	catch ( PDOException $e) {
		echo 'Error al conectarnos ' . $e->getMessage();
	}

	$pdo->exec("SET CHARACTER SET utf8"); // <--utf8
?>