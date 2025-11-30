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

export class numerico extends generico {
	conteudo = function () { return -1 } 
	temSinalzinho = false;
	editavel = false;
	constructor (modo,i, label, temSinalzinho, conteudo, editavel) {
		super(modo,i, label, 0);
		this.temSinalzinho = temSinalzinho;
		this.editavel = editavel;

		this.conteudo = conteudo;
	}

	render () {
		this.labelize();
		if (this.elemValue === undefined) {
			console.warn('elemvalue indefinido para', this);
			return; }
		if (this.conteudo === undefined) {
			this.elemValue.innerHTML = '( ˶°ㅁ°) !!';
			console.warn('Conteúdo indefinido para valor num.', this);
			return; }
		const conteudo = this.conteudo();
		if (conteudo === undefined) {
			this.elemValue.innerHTML = '•́︵•̀';
			console.warn('Conteúdo retornou nada para valor num.', this, '(',conteudo,')');
			return; }

		if (!this.temSinalzinho) {
			this.elemValue.innerHTML = conteudo.toString();
			return;
		}
		this.elemValue.innerHTML = Number.parseFloat(conteudo).toFixed(2);
	}
}
