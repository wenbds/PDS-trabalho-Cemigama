/*

	ー DASHBOARD ー

O arquivo principal que cuida do Dashboard.

Esse arquivo detecta cliques nos botões de marca página
e esconde ou mostra elementos respectivamente ao botão
pressionado.

TODO@FEAT: Integração com banco de dados.
TODO@FEAT: Funcionalidade de gráficos.
TODO@FEAT: Funcionalidade de lista de pesquisas.

TODO@FEAT: Pop-ups e estilos de gerenciamento de tabelas (ex.: produtos).

 */
console.log("hi");

// Modo do dashboard
const modos = {
		dashboard:0,
		cadastro:1,
		entrada:2,
		saida:3,
		controle:4,
		compras:5
	}
let current = modos.dashboard; // o modo selecionado

const modosNomes = [
	"Dashboard",
	"Cadastro",
	"Entrada",
	"Saída",
	"Controle",
	"Compras"
]

// Anatomia
const side = document.getElementById("main-side");
const tela = document.getElementById("main-primary");
const title = document.getElementById("main-title");
var currentElement = document.getElementById('main0');
var currentMarca = document.getElementById("marca0");
const marcaPags = document.querySelectorAll('.marca-pag');

// Muda o modo do Dashboard e atualiza a página de
// acordo com o modo selecionado.
function updateModo (modo) {
	currentElement.style.display = 'none';
	currentElement = document.getElementById('main'+modo.toString());
	currentElement.style.display = 'block';
	title.innerHTML = modosNomes[modo];
}

for (const marca of marcaPags) {
	marca.addEventListener("click", (event) => {
		currentMarca.dataset.sel = false;
		updateModo(marca.dataset.mode);
		currentMarca = marca;
		currentMarca.dataset.sel = true;
	});
}

updateModo(current); // inicializar com o modo que já existe

//ー Dados ー//
const carregaveis = [
	[],
	[],
	[],
	[],
	[],
	[]
];
// // - DASHBOARD - // //
carregaveis[modos.dashboard][0] = []; // trocar por grafico

// // - CADASTRO - // //
//  Nível de produtos
carregaveis [modos.cadastro][0] = new table();
