import { default as fator, generico } from './fator.js';
import { default as editor } from './editor.js';

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
	bd = 0;
	data = [];
	rows = [];
	cols = [];
	fodder = [];
	qrow = 0; qcol = 0;
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
		total.scope = 'row';
		var colspan = 0;

		tfootRow.appendChild(total);
		for (const i in this.trackers) {
			tracker = this.trackers[i];
			if (!tracker.total) { colspan += 1; continue; }
			const td = document.createElement('td');
			td.id = this.fator.strval+'t'+i.toString();
			td.appendChild(document.createTextNode('X'));
			tfootRow.appendChild(td);

			this.cols[i] = td;
		}
		total.colSpan = colspan;
	}

	row (i,fonte) {
		const tr = document.createElement('tr');
		this.tbody.appendChild(tr);
		tr.id = this.fator.strval+i.toString(); // então vai parecer como ex.: s2-0n1
		var elem = 'th'
		for (const j in this.trackers) {
			this.qcol += 1;
			const html = document.createElement(elem);
			if (elem !== 'td') { elem = 'td'; } // Faz que o primeiro item seja th.
			html.appendChild(document.createTextNode(this.trackers[j].get(fonte)));
			tr.appendChild(html);
			if (this.trackers[j].increment) {
				const buttonInc = document.createElement('a');
				buttonInc.classList.add('tb');
				buttonInc.appendChild(document.createTextNode('⬆'));
				html.appendChild(buttonInc);
				const buttonDec = document.createElement('a');
				buttonDec.classList.add('tb');
				buttonDec.appendChild(document.createTextNode('⬇'));
				html.appendChild(buttonDec);
			}
		}
		return tr;
	}

	clear () {
		for (const i in this.rows) {
			this.rows[i].remove();
			delete this.rows[i];
		}
		this.qcol = 0;
		this.qrow = 0;
		this.tbody.innerHTML = '';
		for (const i in this.fodder) {
			this.fodder[i].remove();
			delete this.fodder[i];
		}
	}

	fill () {
		for (const i in this.data) {
			this.qrow += 1;
			this.rows[i] = this.row(i, this.data[i]);
		}
	}

	getSelected () {
		editor.select(0,this);
	}

	toqsFinais () {
		// Adicionar item na tabela
		const adicionRow = document.createElement('tr');
		this.tbody.appendChild(adicionRow);
		const adicionBg  = document.createElement('th');
		adicionBg.scope = 'row';
		adicionBg.colSpan = this.qcol;
		adicionRow.appendChild(adicionBg);
		const adicionBtn = document.createElement('button')
		adicionBtn.onclick = event => (editor.openPronto('adicionar')); // TODO: Isso só se aplica a tabela de "materiais". Tem o de vendas e clientes. Como que o código vai entender qual usar?
		// Ideia: usar argumentos que especificam qual editor deve abrir?
		adicionBtn.classList.add('tbBig');
		adicionBtn.appendChild(document.createTextNode('＋'));
		adicionBg.appendChild(adicionBtn);
		
		// Remover/Editar itens na tabela
		const rmedHead = document.createElement('th');
		rmedHead.scope = "col";
		this.thead.children[0].insertBefore(rmedHead,this.thead.children[0].children[0]);
		this.fodder.push(rmedHead);
		const rmedFoot = document.createElement('td');
		this.tfoot.children[0].insertBefore(rmedFoot,this.tfoot.children[0].children[0]);
		this.fodder.push(rmedFoot);
		for (const i in this.rows) {
			const rmedTd = document.createElement('td');
			rmedTd.classList.add('tbd');
			this.rows[i].insertBefore(rmedTd,this.rows[i].children[0]);
			const rmedButtonRmv = document.createElement('a');
			rmedButtonRmv.classList.add('tb');
			rmedButtonRmv.appendChild(document.createTextNode('ー'));
			rmedButtonRmv.onclick = event => {
				this.getSelected();
				editor.select(1, this.data[i]);
				editor.openPronto('remover');
			};
			rmedTd.appendChild(rmedButtonRmv);
			const rmedButtonEdi = document.createElement('a');
			rmedButtonEdi.classList.add('tb');
			rmedButtonEdi.appendChild(document.createTextNode('＠'));
			rmedButtonEdi.onclick = event => {
				this.getSelected();
				editor.select(1, this.data[i]);
				editor.openPronto('alterar');
			};
			rmedTd.appendChild(rmedButtonEdi);
		}
	}

	totalizar () {
		for (const i in this.cols) {
			var total = 0;
			for (const j in this.rows) {
				total += Number.parseFloat(this.rows[j].children[i].textContent);
			}
			this.cols[i].textContent = '';
			this.cols[i].appendChild(document.createTextNode(!this.trackers[i].totalget ? total : this.trackers[i].totalget(total)));
		}
	}

	render (ctx) {
		this.labelize();
		this.data = ctx.bd[this.bd]
		this.clear();
		this.fill();
		this.totalizar();
		this.toqsFinais();
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
		this.elemento.classList.add('item-barra');

		this.elemEstoq = document.createElement('span');
		this.elemEstoq.classList.add('item-barra-estoq');
		this.elemento.appendChild(this.elemEstoq);
		// this.elemEstoq.textContent = this.ligado.estoq;
		this.elemNome = document.createElement('span');
		this.elemNome.classList.add('item-barra-nome');
		this.elemento.appendChild(this.elemNome);
		// this.elemNome.textContent = this.ligado.nome;

		this.render();
	}

	render () {
		this.elemEstoq.textContent = this.ligado.estoq.toString()+' × ';
		this.elemNome.textContent = this.ligado.nome;
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
	bd = 0;
	data = [];
	itens = [];

	constructor (modo,i, label, bd) {
		super(modo,i, label, 3);
		this.bd = bd;

		// Limpar a tabela (método inseguro?)
		this.elemValue.innerHTML = '';
	}

	atualizar () {
		for (const i in this.itens) {
			this.itens[i].atualizar();
		}
	}
	
	clear () {
		for (const i in this.itens) {
			this.itens[i].morrer();
			delete this.itens[i];
		}
		this.elemValue.innerHTML = '';
	}

	fill () {
		var item;
		for (const i in this.data) {
			item = this.data[i];
			this.itens[i] = new itemBarra(item);
			this.elemValue.appendChild(this.itens[i].elemento);
		}
	}

	render (ctx) {
		this.labelize();
		this.data = ctx.bd[this.bd]
		this.clear();
		this.fill();
	}
}
