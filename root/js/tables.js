import { default as fator, generico } from './fator.js';
import { default as editor } from './editor.js';
const getObject = (data, id) => {
	let bd, collection, obj;
	for (const x in data) {
		bd = data[x]
		for (const y in bd) {
			obj = bd[y];
			if (obj._id === undefined || obj._id['$oid'] !== id['$oid']) continue;
			return obj;
		}
	}
	console.warn(`Não foi possível achar objeto. Dados:`);
	console.warn('data:')
	console.log(data);
	console.warn('id:')
	console.log(id);
}

export default class table extends generico {
	/*
	 Variável `trackers` se refere à lista de propriedades
	 que serão retiradas do banco de dados.
	 
	 ex.:
	 new table(2,0,'Produtos Cadastrados', bdProdutos, [
		{nome:'Produto',total:false,get:'nome'},
		{nome:'Distribuidora',total:false,get:'distribuidora'},
		{nome:'Data',total:false,get:'data'},
		{nome:'Quantidade',total:true,get:'estoq'},
		{nome:'Custo Unitário (R$)',total:true,get:'custoUni'},
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
		if (colspan >= this.trackers.length) tfootRow.classList.add('hidden');
		else total.colSpan = colspan;
	}

	row (i,fonte) {
		const thisData = this.data[this.bd][i];
		const tr = document.createElement('tr');
		this.tbody.appendChild(tr);
		tr.id = this.fator.strval+i.toString(); // então vai parecer como ex.: s2-0n1
		var elem = 'th'
		for (const j in this.trackers) {
			const tracker = this.trackers[j];
			this.qcol += 1;
			const html = document.createElement(elem);
			if (elem !== 'td') { elem = 'td'; } // Faz que o primeiro item seja th.
			html.appendChild(document.createTextNode(
				typeof tracker.get === 'function'
				? tracker.get(fonte)
				: typeof fonte[tracker.get] === 'object'
					? fonte[tracker.get]['$oid'] !== undefined
						? getObject(this.data, fonte[tracker.get])
							? getObject(this.data, fonte[tracker.get])[tracker.obj || 'nome']
							: fonte[tracker.get]
						: new Date(Number.parseFloat(fonte[tracker.get]['$date']['$numberLong'])).toLocaleString('pt-BR')
					: fonte[tracker.get]));
			tr.appendChild(html);
			if (tracker.increment) {
				const buttonInc = document.createElement('a');
				buttonInc.classList.add('tb');
				buttonInc.appendChild(document.createTextNode('⬆'));
				buttonInc.onclick = event => {
					this.getSelected();
					editor.select(1, thisData);
					thisData[tracker.get] += 1;
					this.render({bd:this.data});
					editor.setWait(10);
					editor.beUpdating({bd:{[this.bd]:{[i]:{_id:{['$oid']:thisData._id['$oid']},[tracker.get]:thisData[tracker.get]}}}});
				}
				html.appendChild(buttonInc);
				const buttonDec = document.createElement('a');
				buttonDec.classList.add('tb');
				buttonDec.appendChild(document.createTextNode('⬇'));
				buttonDec.onclick = event => {
					this.getSelected();
					editor.select(1, thisData);
					thisData[tracker.get] -= 1;
					this.render({bd:this.data})
					editor.setWait(10);
					editor.beUpdating({bd:{[this.bd]:{[i]:{_id:{['$oid']:thisData._id['$oid']},[tracker.get]:thisData[tracker.get]}}}});
				}
				html.appendChild(buttonDec);
			}
		}
		return tr;
	}

	getSelected () {
		editor.select(0,this);
		editor.selectMode(this.bd);
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
		for (const i in this.data[this.bd]) {
			this.qrow += 1;
			this.rows[i] = this.row(i, this.data[this.bd][i]);
		}
	}

	toqsFinais () {
		// Adicionar item na tabela
		const adicionRow = document.createElement('tr');
		this.tbody.appendChild(adicionRow);
		const adicionBg  = document.createElement('th');
		adicionBg.scope = 'row';
		adicionBg.colSpan = this.qcol+1;
		adicionRow.appendChild(adicionBg);
		const adicionBtn = document.createElement('button')
		adicionBtn.onclick = event => (editor.openPronto(`adicionar${this.bd}`, this.data));
		adicionBtn.classList.add('tbBig');
		adicionBtn.appendChild(document.createTextNode('＋'));
		adicionBg.appendChild(adicionBtn);

		/* TODO@feat: Barra de pesquisa
		const pesquisa = document.createElement('tr');
		this.tbody.insertBefore(pesquisa,this.tbody.children[0]);
		const pesquisBg = document.createElement('th');
		pesquisBg.scope = 'row';
		pesquisBg.colSpan = this.qcol+1;
		pesquisa.appendChild(pesquisBg);
		pesquisBg.appendChild(document.createTextNode('＋'));
		*/
		
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
				editor.select(1, this.data[this.bd][i]);
				editor.openPronto('remover',this.data);
			};
			rmedTd.appendChild(rmedButtonRmv);
			const rmedButtonEdi = document.createElement('a');
			rmedButtonEdi.classList.add('tb');
			rmedButtonEdi.appendChild(document.createTextNode('＠'));
			rmedButtonEdi.onclick = event => {
				this.getSelected();
				editor.select(1, this.data[this.bd][i]);
				editor.openPronto(`alterar${this.bd}`,this.data);
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
		this.data = ctx.bd
		this.data[this.bd].sort((a,b) => a.nome.localeCompare(b.nome));
		this.clear();
		this.fill();
		this.totalizar();
		this.toqsFinais();
	}

	sort (compareFn) {
		this.data[this.bd].sort(compareFn);
		this.render({bd:this.data});
	}
}

export class itemBarra {
	ligado = {nome:'-'}; // Algum objeto com {nome:string}

	elemento;
	elemNome;
	elemEstoq;

	constructor (ctx, item) {
		this.ligado = item;

		this.elemento = document.createElement('div');
		this.elemento.classList.add('item-barra');

		if (this.ligado.estoq !== undefined) {
			this.elemEstoq = document.createElement('span');
			this.elemEstoq.classList.add('item-barra-estoq');
			this.elemento.appendChild(this.elemEstoq);
			// this.elemEstoq.textContent = this.ligado.estoq;
		}
		this.elemNome = document.createElement('span');
		this.elemNome.classList.add('item-barra-nome');
		this.elemento.appendChild(this.elemNome);
		// this.elemNome.textContent = this.ligado.nome;

		this.render(ctx);
	}

	render (ctx) {
		this.elemEstoq.textContent = this.ligado.estoq.toString()+' × ';
		this.elemNome.textContent = this.ligado.nome;

		if (this.ligado.estoq !== undefined && this.ligado.estoq < Math.floor(this.ligado.estoqMinimo*(1+(ctx.estoqDesejavel*0.01)))) this.elemento.classList.add('perigo');
		else this.elemento.classList.remove('perigo');
	}

	atualizar (ctx, elemEstoq, elemNome) {
		if (!this.ligado) {
			this.morrer();
			return;
		}
		this.render(ctx);
	}

	morrer () {
		delete this.combarra;
		this.elemento.remove();
		delete this.ligado;
	}
}

export class combarra extends generico {
	bd = 0;
	dataDsj = 0;
	data = [];
	itens = [];

	constructor (modo,i, label, bd) {
		super(modo,i, label, 3);
		this.bd = bd;

		// Limpar a tabela (método inseguro?)
		this.elemValue.innerHTML = '';
	}

	atualizar (ctx) {
		for (const i in this.itens) {
			this.itens[i].atualizar(ctx);
		}
	}
	
	clear () {
		for (const i in this.itens) {
			this.itens[i].morrer();
			delete this.itens[i];
		}
		this.elemValue.innerHTML = '';
	}

	fill (ctx) {
		var item;
		for (const i in this.data) {
			item = this.data[i];
			this.itens[i] = new itemBarra(ctx, item);
			this.elemValue.appendChild(this.itens[i].elemento);
		}
	}

	render (ctx) {
		this.labelize();
		this.dataDsj = ctx.estoqDesejavel;
		this.data = ctx.bd[this.bd];
		this.clear();
		this.fill(ctx);
	}
}
