/*

	ー DASHBOARD ー

O arquivo principal que cuida do Dashboard.

Esse arquivo detecta cliques nos botões de marca página
e esconde ou mostra elementos respectivamente ao botão
pressionado.

TODO@FEAT: Pesquisas em tabelas.
TODO@FEAT: Funcionalidade de gráficos.

 */
import { default as fator, generico, numerico } from './fator.js';
import { default as table, combarra } from './tables.js';
import { default as grafico } from './grafico.js';

import { default as editor } from './editor.js';

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
];

const plugarDados = '../main/data.php';
const pmethod = 'POST';
var ppedido = {
	quero: 'nada'
}

// Extrai banco de dados completo
async function pedir (pedido) {
	ppedido.quero = pedido;
	const pbuffer = JSON.stringify(ppedido);
	var resposta = await fetch(plugarDados, {
		method: pmethod,
		body: pbuffer
	})
		.then(r => r.json());
	
	return resposta
}

var psvar = {
	quero: 3, isso: ''
}
// Extrai um valor do BD exclusivo a variáveis de servidor
async function svar (nomeVar) {
	psvar.isso = nomeVar;
	const pbuffer = JSON.stringify(psvar);
	var resposta = await fetch(plugarDados, {
		method: pmethod,
		body: pbuffer
	})
		.then(r => r.json());

	return resposta ? resposta.val : null
}

const BDFUNC_TOTAL = 0;
const BDFUNC_TOTAL_QNT = 1;
const BDFUNC_ACHAR = 2;
const OID = '$oid';
var BDFUNC_COL = 0;
function bdFunc (val, arg) {
	const collection = bd[BDFUNC_COL];
	var index;
	switch (val) {
		case BDFUNC_TOTAL:
			let total = 0.0;
			for (const obj in collection) {
				index = collection[obj]
				if (!index[arg]) {
					console.warn('Objeto inesperado no banco de produtos:',obj,'(não tem',arg,')');
					continue;
				}
				total += Number.parseFloat(index[arg]);
			}
			return total;
		case BDFUNC_TOTAL_QNT:
			let totalQ = 0.0;
			for (const obj in collection) {
				index = collection[obj]
				if (!index[arg] || !index.estoq) {
					console.warn('Objeto inesperado no banco de produtos:',obj,'(não tem',arg,')');
					continue;
				}
				totalQ += Number.parseFloat(index[arg]) * Number.parseFloat(index.estoq);
			}
			return totalQ;
		case BDFUNC_ACHAR:
			for (const obj in collection) {
				index = collection[obj]
				if (!index._id) {
					console.warn('Objeto inesperado no banco de produtos:',obj,'(não tem',arg,')');
					continue;
				}

				if (index._id[OID] === arg) {
					return index;
				}
			}
			break; 
		default:
			console.warn('Função desconhecida:',val);
	}
}

const dinheiro = new Intl.NumberFormat('pt-BR',{style:'decimal',currencyDisplay:'code',maximumFractionDigits:2,minimumFractionDigits:2});
function formatDinheiro (val) { return dinheiro.format(Number.parseFloat(val)); }

const carregaveis = [ // Elementos de dados ("s0-0", "s0-1", etc.)
	[], [], [],
	  [], [],
	    []
];
// // - DASHBOARD - // //
carregaveis [modos.dashboard][0] = new numerico(0,0,'Total em Estoque', false,
	async function () { BDFUNC_COL = 0; return bdFunc (BDFUNC_TOTAL, 'estoq'); },
	false);
carregaveis [modos.dashboard][1] = new numerico(0,1,'Custo Total', true,
	function () { BDFUNC_COL = 0; return bdFunc (BDFUNC_TOTAL_QNT, 'custoUni'); },
	false);
carregaveis [modos.dashboard][2] = new numerico(0,2,'Faturamento', true,
	function () { BDFUNC_COL = 0; return bdFunc (BDFUNC_TOTAL_QNT, 'precoUni'); },
	false);
carregaveis [modos.dashboard][3] = new numerico(0,3,'Lucro', true,
	function () { BDFUNC_COL = 0; return bdFunc (BDFUNC_TOTAL_QNT, 'precoUni') - bdFunc (BDFUNC_TOTAL_QNT, 'custoUni'); },
	false);
carregaveis [modos.dashboard][4] = new grafico(0,4,'Saldo Acumulado');
carregaveis [modos.dashboard][5] = new combarra(0,5,'Estoque', 0); 

// // - CADASTRO - // //
//  Nível de produtos
var estoqDesejavel = await svar('estoqDesejavel');
carregaveis [modos.cadastro][0] = new numerico(1,0,'Estoque Desejável (%)', false,
	async function () {
		estoqDesejavel = await svar('estoqDesejavel');
		return estoqDesejavel;
	},
	true);
carregaveis [modos.cadastro][1] = new table(1,1,'Cadastro de Produtos', 0, [
		{nome:'Produto',total:false,get: x => x.nome},
		{nome:'Nível Mínimo',total:false,get: x => x.estoqMinimo},
		{nome:'Nível Desejável',total:false,get: x => Math.floor(x.estoqMinimo*(1+(estoqDesejavel*0.01)))},
		{nome:'Quantidade',total:true,increment:true,get: x => x.estoq },
		{nome:'Custo Unitário (R$)',total:true,totalget: x => formatDinheiro(x),get: x => formatDinheiro(x.custoUni)},
		{nome:'Preço Unitário (R$)',total:true,totalget: x => formatDinheiro(x),get: x => formatDinheiro(x.precoUni)},
		{nome:'Lucro Unitário (R$)',total:true,totalget: x => formatDinheiro(x),get: x => formatDinheiro(x.precoUni - x.custoUni)}
	]);

// // - ALTERAR - // //
// Alterar produtos
carregaveis [modos.alterar][0] = new table(2,0,'Produtos Cadastrados', 0, [
		{nome:'Produto',total:false,get: x => x.nome},
		{nome:'Distribuidora',total:false,get: x => x.distribuidora},
		{nome:'Quantidade',total:true,increment:true,get: x => x.estoq },
		{nome:'Custo Unitário (R$)',total:true,totalget: x => formatDinheiro(x),get: x => formatDinheiro(x.custoUni)},
		{nome:'Preço Unitário (R$)',total:true,totalget: x => formatDinheiro(x),get: x => formatDinheiro(x.precoUni)},
		{nome:'Lucro (R$)',total:true,totalget: x => formatDinheiro(x),get: x => formatDinheiro(x.precoUni * x.estoq - x.custoUni * x.estoq)}
	 ]);

// // - SAÍDA - // //
// Venda do produto/relatório com o custo e lucro obtido
carregaveis [modos.saida][0] = new numerico(3,0,'Custo Total', true,
	function () { BDFUNC_COL = 0; return bdFunc (BDFUNC_TOTAL_QNT, 'custoUni'); },
	false);
carregaveis [modos.saida][1] = new numerico(3,1,'Faturamento', true,
	function () { BDFUNC_COL = 0; return bdFunc (BDFUNC_TOTAL_QNT, 'precoUni'); },
	false);
carregaveis [modos.saida][2] = new table(3,2,'Venda de Produtos', 1, [
		{nome:'Produto',total:false,get: x => { BDFUNC_COL = 0; const r = bdFunc(BDFUNC_ACHAR,x.produto[OID]); return r ? r.nome : 'Objeto indefinido' }},
		{nome:'Distribuidora',total:false,get: x => x.distribuidora},
		{nome:'Quantidade',total:true,increment:true,get: x => x.estoq },
		{nome:'Custo Unitário (R$)',total:true,totalget: x => formatDinheiro(x),get: x => formatDinheiro(x.custoUni)},
		{nome:'Valor Total (R$)',total:true,totalget: x => formatDinheiro(x),get: x => formatDinheiro(x.custoUni * x.estoq)}
]);

// // - CONTROLE - // //
// Imprime o que está de estoque baixo, produtos menos vendidos e mais vendidos.
carregaveis [modos.controle][0] = new numerico(4,0,'Total em Estoque (R$)', true,
	function () { return bdFunc (BDFUNC_TOTAL_QNT, 'precoUni'); },
	false);

const context = { bd:bd }
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
		objCurrent.render(context);
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

// Execução de update
setInterval(await async function() {
	if (!editor.shouldUpdate) { return; }
	await atualizarDados(ATLZR_TODOS);
	await renderizarPag();
	editor.updated();
}, 500)
