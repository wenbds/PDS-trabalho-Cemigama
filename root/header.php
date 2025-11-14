<header>
	<nav id="navbar">
		<img src="" width="30" height="30" alt="">
		<?php
			if (!empty($_SESSION)) {
				echo '<form action="../db/logout.php" method="POST"><button type="submit" name="submit">';
				echo 'SAIR';
				echo '<!-- botão de log-out -->';
				echo '<!-- TODO: Pop-up de confirmação -->';
				echo '</button></form> ';
			}
		?>	
	</nav>
</header>
