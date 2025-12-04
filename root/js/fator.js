// 
// OBJETO BASE DE FATOR

export default class fator {
	tipo = 0;
	modo = -1;
	index = -1;
	label = 'Fator';

	str = '';
	strval = '';
	
	constructor (modo,i, label, tipo) {
		this.modo = modo;
		this.index = i;
		this.label = label;
		this.tipo = tipo;

		this.str = 's'+this.modo.toString()+'-'+this.index.toString();
		this.strval = this.str+'n';
	}
}

export class generico {
	fator;
	elemLabel;
	elemValue;
	constructor (modo,i, label, n) {
		this.fator = new fator(modo,i, label, n);
		const element = this.getElement;
		if (!element) {
			console.warn('Nenhum element encontrado para ',this,': ',element,'');
			return this;
		}

		for (const child of element.children) {
			if (child.tagName === 'H3') {
				this.elemLabel = child;
				continue;
			} else if (child.id === this.fator.strval) {
				this.elemValue = child;
				continue;
			}
		}
	}

	labelize () {
		if (!this.elemLabel) {
			console.warn('Sem label de elemento em ',this,': ',this.elemLabel,'');
			return;
		}
		this.elemLabel.innerHTML = this.fator.label;
	}

	render () { this.labelize(); }

	get getElement () {
		this.element = document.getElementById(this.fator.str);
		return this.element;
	}
	get getFator () {
		return this.fator;
	}
}

const dinheiro = new Intl.NumberFormat('pt-BR',{style:'decimal',currencyDisplay:'code',maximumFractionDigits:2,minimumFractionDigits:2});
function formatDinheiro (val) { return dinheiro.format(Number.parseFloat(val)); }

export class numerico extends generico {
	conteudo = function () { return -1 } 
	temSinalzinho = false;
	editavel = false;
	fodder = [];
	constructor (modo,i, label, temSinalzinho, conteudo, editavel) {
		super(modo,i, label, 0);
		this.temSinalzinho = temSinalzinho;
		this.editavel = editavel; // Trocar p/ número editável
		if (this.editavel) {
			const novo = document.createElement('input');
			novo.type = 'number';
			novo.classList.add('weakInput');
			novo.min = 0;
			novo.autocomplete = false;
			novo.id = this.fator.strval;
			novo.name = this.fator.strval;
			this.element.appendChild(novo);
			if (this.elemValue) { this.elemValue.remove(); }
			this.elemValue = novo;
		}

		this.conteudo = conteudo;
		if (!this.element) { return; }
		this.element.classList.add('generico');
	}

	async render () {
		this.labelize();
		if (this.elemValue === undefined) {
			console.warn('elemvalue indefinido para', this);
			return; }

		var propMuda = 'innerHTML'
		if (this.editavel) {
			propMuda = 'value';
			this.clear();
			this.toqsFinais();
		}

		if (this.conteudo === undefined) {
			this.elemValue [propMuda] = '( ˶°ㅁ°) !!';
			console.warn('Conteúdo indefinido para valor num.', this);
			return; }
		const conteudo = await this.conteudo();
		if (conteudo === undefined) {
			this.elemValue [propMuda] = '•́︵•̀';
			console.warn('Conteúdo retornou nada para valor num.', this, '(',conteudo,')');
			return; }

		if (!this.temSinalzinho) {
			this.elemValue [propMuda] = conteudo;
			return;
		}
		this.elemValue [propMuda] = formatDinheiro(conteudo);
	}

	toqsFinais () {
		const buttonEdi = document.createElement('a');
		buttonEdi.classList.add('tb');
		buttonEdi.appendChild(document.createTextNode('⬆'));
		this.element.appendChild(buttonEdi);
		this.fodder.push(buttonEdi);
	}

	clear () {
		for (const i in this.fodder) {
			this.fodder[i].remove();
			delete this.fodder[i];
		}
	}
}
