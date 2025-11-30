/*

	ー DASHBOARD ー

O arquivo principal que cuida do Dashboard.

Esse arquivo detecta cliques nos botões de marca página
e esconde ou mostra elementos respectivamente ao botão
pressionado.

TODO@FEAT: Fazer tabelas ser alteráveis.
TODO@FEAT: Pop-ups e estilos de gerenciamento de tabelas (ex.: produtos).
TODO@FEAT: Funcionalidade de gráficos.

 */
import { default as fator, generico, numerico } from './fator.js';
import { default as table, combarra } from './tables.js';
import { default as grafico } from './grafico.js';

// Modo do dashboard
const modos = {
		dashboard:0,
		cadastro:1,
		alterar:2,
		saida:3,
		controle:4,
		vendas:5
	}
let current = modos.dashboard; // o modo selecionado

const modosNomes = [
	"Dashboard",
	"Cadastro de Produtos",
	"Alterar Produtos",
	"Saída de Produtos",
	"Controle de Estoque",
	"Registro de Vendas"
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
	current = modo;
	tela.dataset.current = current;
	currentElement.style.display = 'none';
	currentElement = document.getElementById('main'+modo.toString());
	currentElement.style.display = 'block';
	title.innerHTML = modosNomes[current];
	renderizarPag();
}

for (const marca of marcaPags) {
	marca.addEventListener("click", (event) => {
		currentMarca.dataset.sel = false;
		updateModo(marca.dataset.mode);
		currentMarca = marca;
		currentMarca.dataset.sel = true;
	});
}

// Delay para alguns objetos carregarem p/ JavaScript
const wait = async (ms) => new Promise(resolve => setTimeout(resolve, ms));
wait(1200);

//ー Dados ー//
/* 
	Este arquivo recebe dados através do `root/main/data.php`.
*/

const bd = [ // Dados armazenados do banco de dados. Atualizados com ``
	[], [], [] // 0: produtos, 1: vendas 2: clientes
]
const bdProdutos = bd[0];
const bdVendas   = bd[1];
const bdClientes = bd[2];

const plugarDados = '../main/data.php';
const pmethod = 'POST';
var pbuffer;
var ppedido = {
	quero: 'nada'
}

async function pedir (pedido) {
	ppedido.quero = pedido;
	pbuffer = JSON.stringify(ppedido);
	var resposta = await fetch(plugarDados, {
		method: pmethod,
		body: pbuffer
	})
		.then(r => r.json());
	
	return resposta
}

const BDFUNC_TOTAL = 0;
function bdFunc (val, arg) {
	switch (val) {
		case BDFUNC_TOTAL:
			let total = 0.0;
			for (const obj in bdProdutos) {
				if (!obj[arg]) {
					console.warn('Objeto inesperado no banco de produtos:',obj,'(não tem',arg,')');
					continue;
				}
				total += Number.parseFloat(obj[arg]);
			}
			return total;
		default:
			console.warn('Função desconhecida:',val);
	}
}

const carregaveis = [ // Elementos de dados ("s0-0", "s0-1", etc.)
	[], [], [],
	  [], [],
	    []
];
// // - DASHBOARD - // //
carregaveis [modos.dashboard][0] = new numerico(0,0,'Total em Estoque', false,
	function () { return bdProdutos.length; },
	false);
carregaveis [modos.dashboard][1] = new numerico(0,1,'Custo Total', true,
	function () { return bdFunc (BDFUNC_TOTAL, 'custoUni'); },
	false);
carregaveis [modos.dashboard][2] = new numerico(0,2,'Faturamento', true);
carregaveis [modos.dashboard][3] = new grafico(0,3,'Saldo Acumulado');
carregaveis [modos.dashboard][4] = new combarra(0,4,'Estoque', bd[0]); 

// // - CADASTRO - // //
//  Nível de produtos
carregaveis [modos.cadastro][0] = new numerico(1,0,'Estoque Desejável', false);
carregaveis [modos.cadastro][1] = new table(1,1,'Cadastro de Produtos');

// // - ALTERAR - // //
// Alterar produtos
carregaveis [modos.alterar][0] = new table(2,0,'Produtos Cadastrados', bdProdutos, [
		{nome:'Produto',total:false,get: x => x.nome},
		{nome:'Distribuidora',total:false,get: x => x.distribuidora},
		{nome:'Data',total:false,get: x => x.data },
		{nome:'Quantidade',total:true,get: x => x.estoq },
		{nome:'Custo Unitário (R$)',total:true,get: x => x.custoUni },
		{nome:'Valor Total (R$)',total:true,get: x => x.custoUni * x.estoq }
	 ]);

// // - SAÍDA - // //
// Venda do produto/relatório com o custo e lucro obtido
carregaveis [modos.saida][0] = new numerico(3,0,'Custo Total', true);
carregaveis [modos.saida][1] = new numerico(3,1,'Lucro Total', true);
carregaveis [modos.saida][2] = new table(3,2,'Venda de Produtos');

// // - CONTROLE - // //
// Imprime o que está de estoque baixo, produtos menos vendidos e mais vendidos.
carregaveis [modos.controle][0] = new table(4,0,'AAAAAAAAAAAA');

function renderizarPag () {
	const praCarregar = carregaveis[current];
	const strObjetos  = 's'+current+'-';
	let strCurrent;
	let objCurrent;
	let elmCurrent;
	for (let i = 0; i < praCarregar.length; i++) {
		strCurrent = strObjetos + i.toString();
		objCurrent = praCarregar[i];
		elmCurrent = document.getElementById(strCurrent + 'n');

		console.log('Carregando ' + strCurrent + ':',objCurrent);
		objCurrent.render();           // TODO Usar "elmcurrent" talvez seja perigoso? Porque muda constantemente
		                               //      e `fator` tem uma referência interna ao elemento já (então é redundante)
	}
}

const ATLZR_PRODUTOS = 1 << 0;
const ATLZR_VENDAS   = 1 << 1;
const ATLZR_CLIENTES = 1 << 2;
const ATLZR_TODOS    = ATLZR_PRODUTOS
                       | ATLZR_VENDAS
	                 | ATLZR_CLIENTES;

// Atualiza a coleção do BD especificado
// ex.: atualizarDados (ATLZR_VENDAS | ATLZR_CLIENTES);
//	atualiza as coleções vendas e clientes.
async function atualizarDados (bin) {
	for (let i = 0; i < bd.length; i++) {
		if (!(bin & (1 << i))) { continue; }
		bd[i] = await pedir(i);
	}
}

// // 
//ー Funcionamento ー//
                  // //

// TODO Os valores do BD devem ser atualizados toda vez que algo é alterado no BD.
await atualizarDados(ATLZR_TODOS);

await updateModo(current); // inicializar com o modo que já existe
console.log(bd);
