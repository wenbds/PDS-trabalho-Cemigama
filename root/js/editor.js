import popup, * as handler from '../js/popup.js';
const body = document.querySelector('body');

export function throwFunctFactory (tipo, titulo) {
	return function (str) {
		const thisPopup = new popup(tipo, titulo, str);
		thisPopup.pop(body);
	};
}
export const throwErro  = throwFunctFactory (handler.TIPO_ERRO, 'Erro');
export const throwAviso = throwFunctFactory (handler.TIPO_AVISO, 'Aviso');

const plugarDados = '../main/editor.php'
const pmethod ='POST';
var pedido = {
	fazer: ':'
}
var responsePop;
function popResponse (tipo, titulo, str) {
	if (responsePop !== undefined && responsePop.element) {
		responsePop.close();
		responsePop = undefined;
	}

	responsePop = new popup(tipo, titulo, str);
	responsePop.pop(body);
}
const selection     = []; // buffers para ítens de interesse para o editor
const selectionMany = []; // múltiplos campos selecionados no mesmo tempo
var selectMode = 0;

async function edit () {
	editor.updating();
	const pbuffer = JSON.stringify(pedido);
	pedido = {fazer:':'};
	var resposta = await fetch(plugarDados, {
		method: pmethod,
		body: pbuffer
	});
	return resposta
}

const PSCHEMA_MATERIAL = [
	[[handler.PART_INPUT,'nome','Nome do material','']],
	[[handler.PART_INPUT,'tipo','Tipo de material','']],
	[[handler.PART_INPUT,'distribuidora','Distribuidora','']],
	[[handler.PART_MONEY,'precoUni','Preço unitário (R$)',0]],
	[[handler.PART_MONEY,'custoUni','Custo unitário (R$)',0]],
	[[handler.PART_NUMERO,'estoq','Estoque atual',0]],
	[[handler.PART_NUMERO,'estoqMinimo','Estoque mínimo',0]]
]
const PSCHEMA_VENDA = [
	[[handler.PART_DROP,'cliente','Cliente']],
	[[handler.PART_DROP,'produto','Material vendido']],
	[[handler.PART_MONEY,'valor','Valor (R$)',0]],
	[[handler.PART_NUMERO,'quant','Quantidade',0]],
	[[handler.PART_TIME,'data','Data','HOJE']]
]
const PSCHEMA_CLIENTE = [
	[[handler.PART_INPUT,'nome','Nome','']],
	[[handler.PART_INPUT,'endereco','Endereço','']],
	[[handler.PART_CPFCNPJ,'cpf-cnpj','CPF/CNPJ','']]
]

function factoryAdicionar (mode, nome) {
	return async function(self) {
		await self.popup.close();
		const r = handler.getBuffer(0);
		pedido.fazer = 'w';
		pedido.tipo = selectMode;
		pedido.dados = r;
		const response = await edit();
		if (response && response.ok) { popResponse(handler.TIPO_NORMAL, "Sucesso", `${String(nome).charAt(0).toUpperCase() + String(nome).slice(1)} "${r.nome}" cadastrado`);
		} else { popResponse(handler.TIPO_ERRO, "Erro", `Erro tentando cadastrar ${String(nome)}. Resposta: `+response.json()); }
	}
}

function factoryAdicionarSchema (mode, nome, artigo, schema) {
	const novo = [
		`Cadastrar ${nome}`,
		`Preencha todos os campos descrevendo ${artigo} ${nome} a ser cadastrad${artigo}.`,
		0,
		[]
	];

	for (const i in schema) {
		novo[3][i] = [];
		for (const j in schema[i]) {
			novo[3][i][j] = [].concat(schema[i][j]);
		}
	}

	novo[3].push([[handler.PART_BOTAO,'btCriar','Adicionar',factoryAdicionar(mode,nome)],
	 [handler.PART_BOTAO,'btCancelar','Cancelar',async function(self) {
		// TODO Confirmar? Ou simplesmente tira esse treco?
		self.popup.modalSave = -1;
		await self.popup.close();
	 }]]);
	return novo;
}

function factoryAlterar (mode, nome) {
	return async function(self) {
		await self.popup.close();
		const r = handler.getBuffer(1);
		pedido.fazer = 'u';
		pedido.tipo = selectMode;
		pedido.id = selection[1]._id['$oid'];
		pedido.dados = r;
		const response = await edit();
		if (response && response.ok) { popResponse(handler.TIPO_NORMAL, "Sucesso", `${String(nome).charAt(0).toUpperCase() + String(nome).slice(1)} "${r.nome}" alterado`);
		} else { popResponse(handler.TIPO_ERRO, "Erro", `Erro tentando alterar ${String(nome)}. Resposta: `+response.json()); }
	}
}

function factoryAlterarSchema (mode, nome, artigo, schema) {
	const novo = [
		`Alterar ${nome}`,
		() => `Preencha todos os campos descrevendo mudanças n${artigo} ${nome} "${selection[1].nome}".`,
		1,
		[]
	];

	for (const i in schema) {
		novo[3][i] = [];
		for (const j in schema[i]) {
			novo[3][i][j] = [].concat(schema[i][j]);
			novo[3][i][j][3] = () => {
				if (!selection[1]) {
					throwErro(`Objeto não foi selecionado corretamente: ${selection}`);
					return schema[i][j][3];
				}
				return selection[1][novo[3][i][j][1]];
			}
		}
	}

	novo[3].push([[handler.PART_BOTAO,'btSalvar','Salvar',factoryAlterar(mode,nome)],
	 [handler.PART_BOTAO,'btCancelar','Cancelar',async function(self) {
		self.popup.modalSave = -1;
		await self.popup.close();
	 }]]);
	return novo;
}

const jáPronto = {
	remover: [
		"Remover item",
		() => `Você tem certeza que quer remover o item "${selection[1].nome}" da tabela?\nNão será possível desfazer esta decisão.`,
		null,
		[
			[[handler.PART_BOTAO,'btSim','Sim', async function(self) {
				await self.popup.close();
				pedido.fazer = 'r';
				pedido.tipo = selectMode; 
				pedido.objeto = selection[1];
				const response = await edit();
				if (response && response.ok) { popResponse(handler.TIPO_NORMAL, "Sucesso", "Item \""+selection[1].nome+"\" removido com êxito");
				} else { popResponse(handler.TIPO_ERRO, "Erro", "Erro tentando remover item. Resposta: "+response.json()); }
			}],[handler.PART_BOTAO,'btNão','Não', async function(self) {
				await self.popup.close();
			}]]
		]
	],
	adicionar0: await factoryAdicionarSchema(0, 'material', 'o', PSCHEMA_MATERIAL),
	adicionar1: await factoryAdicionarSchema(0, 'venda', 'a', PSCHEMA_VENDA),
	adicionar2: await factoryAdicionarSchema(0, 'cliente', 'o(a)', PSCHEMA_CLIENTE),
	alterar0: await factoryAlterarSchema(0, 'material', 'o', PSCHEMA_MATERIAL),
	alterar1: await factoryAlterarSchema(0, 'venda', 'a', PSCHEMA_VENDA),
	alterar2: await factoryAlterarSchema(0, 'cliente', 'o(a)', PSCHEMA_CLIENTE)
}

class editAPI {
	popup;
	shouldUpdate = false;

	select (slot, variable) {
		selection [slot || 0] = variable;
	}

	clearSelection () {
		selection = [];
		selectionMany = [];
	}

	open (title, msg, partes, save) {
		this.popup = new popup(handler.TIPO_NORMAL, title, msg, partes);
		this.popup.modalSave = save;
		this.popup.modal = true;
		this.popup.pop(body);
		return this.popup;
	}
	openPronto (index, ctx) {
		const lista = jáPronto[index];
		if (!lista) {
			throwErro('Lista não existe no índice: '+index.toString());
			return;
		}
		this.open(
			typeof lista[0] === 'function' ? lista[0](ctx) : lista[0],
			typeof lista[1] === 'function' ? lista[1](ctx) : lista[1],
			lista[3], lista[2]);
	}

	// Aplica as edições
	edit () {
		return edit();
	}

	// Editar uma variável
	async editVar (varName) {
		pedido.fazer = 'wv';
		pedido.var = varName;
		pedido.val = selection[1];
		const response = await edit();
		if (response && response.ok) { popResponse(handler.TIPO_NORMAL, "Sucesso", `Variável foi alterada.`);
		} else { popResponse(handler.TIPO_ERRO, "Erro", `Erro tentando alterar variável. Resposta: `+response.json()); }
	}

	// Chama a atualização do main/index.php
	updating() {
		this.shouldUpdate = true;
	}

	// Resposta do main/index.php
	updated() {
		this.shouldUpdate = false;
	}
}

var editor = new editAPI();
export default editor; 
