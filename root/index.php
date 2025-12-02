<!DOCTYPE html>
<!-- TELA DE LOG-IN -->
<!-- [Iizuka]
	Tem um monte de coisa que eu percebi que nem sou
	bom em fazer e que não sou programador. 😅

	TODO:
	- A funcionalidade de tabelas e gráficos.
	- O banco de dados.
-->
<html lang="pt">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<!-- <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous"> -->
		<link rel="stylesheet" href="css/style.css">
		<title>Plan & Decor Estoque</title>
	</head>
	<body>
		<!-- conter em todas as páginas -->
		<?php
			include_once 'header.php';
		?>

		<!-- conteúdo -->
		<div class="container">
			<script type='module'>
				// Reação do código com o site
				import popup, * as handler from './js/popup.js';

				const params = await handler.getParams();
				if (params.error) {
					const errPopup = new popup(handler.TIPO_ERRO, 'Erro', handler.ERRO_MENSAGENS[params.error]);
					console.log(errPopup);
					errPopup.pop(document.querySelector('body'));
				}
			</script>
			<div class="bg" style="background-image: url('asset/image/gradiente.jpg');
				background-size: cover;">
				<div id="login-side" class="container-fluid">
					<div id="login-main">
						<h1 class="text-primary">Log In</h1>
						<section id="login-inputs">
							<form method="post" action="db/login.php">
								<div class="form-group">
									<input type="text" class="form-control" name="user" placeholder="Nome do usuário">
								</div>
								<div class="form-group">
									<input type="password" class="form-control loginInput" name="senha" placeholder="Senha">
									<!--<div class="loginSmall">
										<a class="text-primary">Esqueci minha senha</a> <!-- TODO: Remover ou implementar pop-up -->
										<!--</div>-->
								</div>
								<input type="submit" class="bg-primary" name="submit" value="Entrar">
								<!-- TODO: Sistema de banco de dados, o sistema só te coloca no outra página. -->
							</form>
						</section>
					</div>
				</div>
			</div>
		</div>

		<?php
			include_once 'footer.php';
		?>
	</body>
</html>
