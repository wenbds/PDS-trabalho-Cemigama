const getUrlParams = url => `${url}?`.split('?')[1]
  .split('&').reduce((params, pair) =>
    ((key, val) => key ? {...params, [key]: val} : params)
    (...`${pair}=`.split('=').map(decodeURIComponent)), {});

export async function getParams () {
	var response = getUrlParams(document.URL);
	return response;
}

const bufferSave = [{},{},{},{},{},{},{},{}];
export function getBuffer (slot) {
	return bufferSave [slot];
}

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
	modalSave = -1;

	constructor (tipo, title, msg, partes) {
		this.tipo  = tipo;
		this.title = title;
		this.msg   = msg;
		this.partesData = partes;

		const element = document.createElement('div');
		element.classList.add('popup', 'topcenter', TIPO_CLASS[this.tipo]); // TODO mudar Align Style?
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

		const elemRow = document.createElement('div');
		elemRow.classList.add('list-box');
		element.appendChild(elemRow);
		this.element.rows = elemRow;
	}

	async pop (onde) {
		onde.appendChild(this.element.base);
		if (this.modal) {
			this.element.base.setAttribute('ariaModal',true);
			this.element.base.setAttribute('role','dialog');
			const modalBg = document.querySelector('.modal-bg');
			modalBg.classList.add('show');
		}

		for (const i in this.partesData) {
			const dataSet = this.partesData[i];
			const row = document.createElement('div');
			row.classList.add('row');
			this.element.rows.appendChild(row);
			for (const j in dataSet) {
				const data = dataSet[j];
				const parte = new popupPart (data[0],data[1],data[2],data[3],data[4],this.modalSave);
				parte.add(this, row);
				this.partes.push(parte);
			}
		}
	}

	save (slot) {
		for (const i in this.partes) {
			const parte = this.partes[i];
			parte.save(slot);
			parte.remove();
			delete this.partes [i], parte;
		}
	}

	close () {
		if (this.modal) {
			this.element.base.removeAttribute('ariaModal');
			this.element.base.removeAttribute('role');
			const modalBg = document.querySelector('.modal-bg');
			modalBg.classList.remove('show');
		}

		if (this.modalSave >= 0) this.save(this.modalSave);

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

function parseVirgula(str) {
	return Number.parseFloat(str.toString().replaceAll('.','').replace(',', '.'));
}
const dinheiro = new Intl.NumberFormat('pt-BR',{style:'decimal',currencyDisplay:'code',maximumFractionDigits:2,minimumFractionDigits:2});
export const PART_DATA = [ ];
	PART_DATA [PART_TITULO] = {elem:'h2',noName:true,nameInside:true};
	PART_DATA [PART_TEXTO]  = {elem:'p',noName:true,nameInside:true};
	PART_DATA [PART_BOTAO]  = {elem:'button',noName:true,nameInside:true};
	PART_DATA [PART_DIVISN] = {elem:'hr',noName:true,elemIsBase:true};
	PART_DATA [PART_INPUT]  = {elem:'input'};
	PART_DATA [PART_NUMERO] = {elem:'input',reader: self => parseVirgula(self) };
	PART_DATA [PART_MONEY]  = {elem:'input',reader: self => parseVirgula(self), format: self => dinheiro.format(parseVirgula(self))};
	PART_DATA [PART_DROP]   = {elem:'input'};
	PART_DATA [PART_LISTA]  = {elem:'div'};
	PART_DATA [PART_TIME]   = {elem:'input'};

export class popupPart {
	tipo = PART_TEXTO;
	popup;
	nome = 'Alguma coisa';
	conteudo;
	value;
	element = {};

	constructor (tipo, nome, display, value, conteudo, saveSlot) {
		this.tipo = tipo;
		const part = PART_DATA[this.tipo];
		if (!part) {
			console.warn(`No type for ${this.tipo}: ${part}`);
			return;
		}
		this.nome = nome;
		this.display = display;

		if (bufferSave [saveSlot] !== undefined && bufferSave [saveSlot] [nome] !== undefined) {
			this.value = bufferSave [saveSlot] [nome];
			delete bufferSave [saveSlot] [nome];
		} else {this.value = (typeof value === 'function' && this.tipo !== PART_BOTAO) ? value() : value;}

		this.conteudo = conteudo;

		const elemBase = document.createElement(!part.elemIsBase ? 'span' : part.elem);
		elemBase.id = 'popup-'+this.nome;
		this.element.base = elemBase;

		const elemNome = document.createElement('span');
		elemNome.id = 'popup-'+this.nome+'n';
		if (!part.noName) elemNome.appendChild(document.createTextNode(this.display));
		this.element.nome = elemNome;
		elemBase.appendChild(elemNome);

		const elemValue = document.createElement(!part.elemIsBase ? part.elem : 'span');
		elemValue.id = 'popup-'+this.nome+'v';
		if (part.nameInside) elemValue.appendChild(document.createTextNode(this.display));
		if (part.valueInside) elemValue.appendChild(document.createTextNode(this.value));
		elemValue.value = this.value;
		this.element.value = elemValue;
		elemBase.appendChild(elemValue);


		if (this.tipo === PART_BOTAO) { 
			elemValue.addEventListener('click', () => {
				if (typeof this.value === 'function') { this.value(this); } });
		} else {
			if (part.format) elemValue.value = part.format(this.value);
			elemValue.addEventListener('blur', () => {
				if (part.format) elemValue.value = part.format(elemValue.value);
				this.value = !part.reader ? elemValue.value : part.reader(elemValue.value);
			});
		}
	}

	add (popup, onde) {
		this.popup = popup;
		onde.appendChild(this.element.base);
	}

	save (slot) {
		if (this.tipo === PART_BOTAO
			|| this.tipo === PART_DIVISN
			|| !bufferSave [slot])
		{return;}

		bufferSave [slot] [this.nome] = this.value;
	}

	remove () {
		this.element.base.remove();
		delete this.element;
	}
}
