import { default as fator, generico } from './fator.js';
export default class table extends generico {
	/*
	 Variável `trackers` se refere à lista de propriedades
	 que serão retiradas do banco de dados.
	 
	 ex.:
	 new table(2,0,'Produtos Cadastrados', bdProdutos, [
		{nome:'Produto',total:false,get: x => x.nome},
		{nome:'Distribuidora',total:false,get: x => x.distribuidora},
		{nome:'Data',total:false,get: x => x.data },
		{nome:'Quantidade',total:true,get: x => x.estoq },
		{nome:'Custo Unitário (R$)',total:true,get: x => x.custoUni },
		{nome:'Valor Total (R$)',total:true,get: x => x.custoUni * x.estoq }
	 ]);
	 */
	trackers = [];
	bd = [];
	thead; tbody; tfoot;
	constructor (modo,i, label, bd, trackers) {
		super(modo,i, label, 1);

		this.bd = bd;
		this.trackers = trackers;
		if (!this.elemValue) {
			console.warn("Não foi possível encontrar a tabela para", this);
			return;
		}

		// Limpar a tabela (método inseguro?)
		this.elemValue.innerHTML = '';

		// Criar estrutura da tabela nova
		this.thead = document.createElement('thead');
		this.tbody = document.createElement('tbody');
		this.tfoot = document.createElement('tfoot');

		this.elemValue.appendChild(this.thead);
		this.elemValue.appendChild(this.tbody);
		this.elemValue.appendChild(this.tfoot);

		// Adicionar os rows importantes
		const theadRow = document.createElement('tr');
		this.thead.appendChild(theadRow);

		var tracker;
		
		for (const i in this.trackers) {
			tracker = this.trackers[i];
			const th = document.createElement('th');
			th.scope = 'col';
			th.appendChild(document.createTextNode(tracker.nome.toString()));
			theadRow.appendChild(th);
		}

		const tfootRow = document.createElement('tr');
		this.tfoot.appendChild(tfootRow);
		const total = document.createElement('th');
		total.appendChild(document.createTextNode('Total'));
		var colspan = 0;
		total.scope = 'row';
		tfootRow.appendChild(total);
		for (const i in this.trackers) {
			tracker = this.trackers[i];
			if (!tracker.total) { colspan += 1; continue; }
			const td = document.createElement('td');
			td.appendChild(document.createTextNode('X'));
			tfootRow.appendChild(td);
		}
	}

	render () {
		this.labelize();
	}
}

export class itemBarra {
	ligado = {nome:'-',estoq:0}; // Algum objeto com {nome:string, estoq:int}

	elemento;
	elemNome;
	elemEstoq;

	constructor (item) {
		this.ligado = item;

		this.elemento = document.createElement('div');
		this.elemento.class = 'item-barra';

		this.elemNome = document.createElement('div');
		this.elemNome.class = 'item-barra-nome';
		// this.elemNome.textContent = this.ligado.nome;
		this.elemEstoq = document.createElement('span');
		this.elemEstoq.class = 'item-barra-estoq';
		// this.elemEstoq.textContent = this.ligado.estoq;

		this.render();
	}

	render () {
		this.elemNome.textContent = this.ligado.nome;
		this.elemEstoq.textContent = this.ligado.estoq;
	}

	atualizar (elemEstoq, elemNome) {
		if (!this.ligado) {
			this.morrer();
			return;
		}
		this.render();
	}

	morrer () {
		this.elemento.remove();
		delete this.ligado;
	}
}

export class combarra extends generico {
	bd = [];
	itens = [];

	constructor (modo,i, label, bd) {
		super(modo,i, label, 3);
		this.bd = bd;

		// Limpar a tabela (método inseguro?)
		this.elemValue.innerHTML = '';

		var item;
		for (const i in this.bd) {
			item = this.bd[i];
			this.itens[i] = new itemBarra(this.bd[i]);
			this.elemValue.appendChild(itens[i].elemento);
		}
	}

	atualizar () {
		for (const i in this.itens) {
			this.itens[i].atualizar();
		}
	}

	render () {
		this.labelize();
	}
}
