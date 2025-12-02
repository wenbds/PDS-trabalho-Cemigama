const getUrlParams = url => `${url}?`.split('?')[1]
  .split('&').reduce((params, pair) =>
    ((key, val) => key ? {...params, [key]: val} : params)
    (...`${pair}=`.split('=').map(decodeURIComponent)), {});

export async function getParams () {
	var response = getUrlParams(document.URL);
	return response;
}

const bufferSave = {};

export const TIPO_NORMAL = 0;
export const TIPO_AVISO  = 1;
export const TIPO_ERRO   = 2;
export const TIPO_CLASS  = [ 'normal', 'warning', 'error' ]
export const ERRO_MENSAGENS = {
	results: 'Credenciais inválidos.',
	invalid: 'Credenciais inválidos.',
	denied: 'Acesso negado. Por favor faça log in.',
	estrutura: 'Erro interno na estrutura do banco de dados.',
}
export default class popup {
	tipo = TIPO_NORMAL;
	title;
	msg  = 'Esse popup está vazio :]';
	element = {};
	partes = [];
	partesData = [];
	modal = false;
	modalSave = false;

	constructor (tipo, title, msg, partes) {
		this.tipo  = tipo;
		this.title = title;
		this.msg   = msg;
		this.partesData = partes;

		const element = document.createElement('div');
		element.classList.add('popup', 'topcenter', TIPO_CLASS[this.tipo]);
		this.element.base = element;
		
		const baseRow = document.createElement('div');
		baseRow.classList.add('row');
		element.appendChild(baseRow);
		this.element.baseRow = baseRow;

		if (this.title) {
			const elemTitle = document.createElement('h2');
			elemTitle.appendChild(document.createTextNode(this.title));
			baseRow.appendChild(elemTitle);
			this.element.title = elemTitle;
		}

		const elemMsg = document.createElement('p');
		elemMsg.appendChild(document.createTextNode(this.msg));
		baseRow.appendChild(elemMsg);
		this.element.msg = elemMsg;

		const elemClose = document.createElement('button');
		elemClose.classList.add('close')
		const image = new Image(20,20);
		image.src = '../asset/image/close.png'
		elemClose.appendChild(image);
		element.appendChild(elemClose);
		this.element.close = elemClose;
		elemClose.onclick = () => { this.close(); };
	}

	async pop (onde) {
		onde.appendChild(this.element.base);
		if (this.modal) {
			this.element.base.ariaModal = true
			const modalBg = document.querySelector('.modal-bg');
			modalBg.classList.add('show');
		}

		for (const i in this.partesData) {
			const dataSet = this.partesData[i];
			const row = document.createElement('div');
			row.classList.add('row');
			this.element.base.appendChild(row);
			for (const j in dataSet) {
				const data = dataSet[j];
				const parte = new popupPart (data[0],data[1],data[2],data[3],data[4]);
				parte.add(row);
			}
		}
	}

	close () {
		if (this.modal) {
			this.element.base.ariaModal = false 
			const modalBg = document.querySelector('.modal-bg');
			modalBg.classList.remove('show');
		}
		for (const i in this.partes) {
			const parte = this.partes[i];
			bufferSave [parte] = parte.value;
			parte.remove();
			delete this.partes [i], parte;
		}
		this.element.base.remove();
		delete this.element;
	}
}

export const PART_TITULO = 0;
export const PART_TEXTO  = 1;
export const PART_BOTAO  = 2;
export const PART_DIVISN = 3;
export const PART_INPUT  = 4;
export const PART_NUMERO = 5;
export const PART_MONEY  = 6;
export const PART_DROP   = 7;
export const PART_LISTA  = 8;
export const PART_TIME   = 9;

export const PART_DATA = [ ];
	PART_DATA [PART_TITULO] = {elem:'h2'};
	PART_DATA [PART_TEXTO]  = {elem:'p'};
	PART_DATA [PART_BOTAO]  = {elem:'button'};
	PART_DATA [PART_DIVISN] = {elem:'hr'};
	PART_DATA [PART_INPUT]  = {elem:'input'};
	PART_DATA [PART_NUMERO] = {elem:'input'};
	PART_DATA [PART_MONEY]  = {elem:'input'};
	PART_DATA [PART_DROP]   = {elem:'input'};
	PART_DATA [PART_LISTA]  = {elem:'div'};
	PART_DATA [PART_TIME]   = {elem:'input'};

export class popupPart {
	tipo = PART_TEXTO;
	nome = 'Alguma coisa';
	conteudo;
	value = 'é alguma coisa';
	element = {};

	constructor (tipo, nome, display, value, conteudo) {
		this.tipo = tipo;
		this.nome = nome;
		this.value = value;
		this.conteudo = conteudo;

		const teste = document.createElement(PART_DATA[this.tipo].elem);
		teste.appendChild(document.createTextNode(this.nome));
		this.element.base = teste;
	}

	add (onde) {
		onde.appendChild(this.element.base);
	}

	remove () {
		this.element.base.remove();
		delete this.element;
	}
}
