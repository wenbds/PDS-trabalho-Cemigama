// 
// OBJETO BASE DE FATOR

export default class fator {
	tipo = 0;
	modo = -1;
	index = -1;
	label = 'Fator';
	
	constructor (modo,i, label, tipo) {
		this.modo = modo;
		this.index = i;
		this.label = label;
		this.tipo = tipo;
	}
}

export class generico {
	fator = -1;
	constructor (modo,i, label, n) {
		this.fator = new fator(modo,i, label, n);
	}

	render () {}

	get getElement () {
		this.element = document.getElementById('s'+toString(this.fator.modo)+'-'+toString(this.fator.index));
		return this.element;
	}
	get getFator () {
		return this.fator;
	}
}

export class numerico extends generico {
	conteudo = function () { return -1 } 
	temSinalzinho = false;
	constructor (modo,i, label, temSinalzinho, conteudo) {
		super(modo,i, label, 0);
		this.temSinalzinho = temSinalzinho;

		this.conteudo = conteudo;
	}

	render (element) {
		if (this.conteudo === undefined) { console.warn('Conteúdo indefinido para tabela', this); return; }
		element.innerHTML = toString(this.conteudo());
	}
}
