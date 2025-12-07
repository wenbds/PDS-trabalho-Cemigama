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
var bufferCtx;
export function setContext (ctx) {
	bufferCtx = ctx;
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
export const PART_CPFCNPJ= 10;

function virgulasRPontosViceVersa(floatN) {
	return floatN.toString().replaceAll('.','~').replaceAll(',','.').replaceAll('~',',');
}
function parseVirgula(str) {
	str = str.toString();
	if (str.lastIndexOf('.')>=0 && str.lastIndexOf(',') < 0) {
		return parseVirgula(str.replaceAll('.',','));
	}
	return Number.parseFloat(str.replaceAll('.','').replace(',', '.'));
}
function parseCPF(str) {
	var res = str.toString().substring(0,14).replaceAll('.','').replaceAll(',','')
	return res;
}
function cpfFormat(str) {
	var res = str.toString();
	if (res.length <= 11) {
		res = Number.parseInt(res);
	} else {
		
	}
	return res.toString();
}
const dinheiro = new Intl.NumberFormat('pt-BR',{style:'decimal',currencyDisplay:'code',maximumFractionDigits:2,minimumFractionDigits:2});
const numeral = new Intl.NumberFormat('pt-BR',{style:'decimal',currencyDisplay:'code'});
export const PART_DATA = [ ];
	PART_DATA [PART_TITULO] = {elem:'h2',noName:true,nameInside:true};
	PART_DATA [PART_TEXTO]  = {elem:'p',noName:true,nameInside:true};
	PART_DATA [PART_BOTAO]  = {elem:'button',noName:true,nameInside:true};
	PART_DATA [PART_DIVISN] = {elem:'hr',noName:true,elemIsBase:true};
	PART_DATA [PART_INPUT]  = {elem:'input'};
	PART_DATA [PART_NUMERO] = {elem:'input', reader: self => parseVirgula(self), format: self => numeral.format(parseVirgula(self)) };
	PART_DATA [PART_MONEY]  = {elem:'input', reader: self => parseVirgula(self), format: self => dinheiro.format(parseVirgula(self))};
	PART_DATA [PART_DROP]   = {elem:'select'};
	PART_DATA [PART_LISTA]  = {elem:'div'};
	PART_DATA [PART_TIME]   = {elem:'input',parser: self => typeof self === 'object' && self['$date'] !== undefined ? new Date(Number.parseFloat(self['$date']['$numberLong'])).toString() : self};
	PART_DATA [PART_CPFCNPJ]= {elem:'input',reader: self => parseCPF(self), format: self => cpfFormat(parseCPF(self))};

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
		const parser = part.parser || (x => x);
		if (!part) {
			console.warn(`No type for ${this.tipo}: ${part}`);
			return;
		}
		this.nome = nome;
		this.display = display;

		const saved = bufferSave [saveSlot] !== undefined && bufferSave [saveSlot] [nome] !== undefined;
		if (this.tipo !== PART_TIME && this.tipo !== PART_DROP) {
			if (typeof value !== 'function' && saved) {
				this.value = parser(bufferSave [saveSlot] [nome]);
				delete bufferSave [saveSlot] [nome];
			} else
				this.value = parser(
					typeof value === 'function' && this.tipo !== PART_BOTAO
						? value()
						: value);
		}

		this.conteudo = conteudo; // Utilizado por PART_DROP

		const elemBase = document.createElement(!part.elemIsBase ? 'span' : part.elem);
		elemBase.id = 'popup-'+this.nome;
		this.element.base = elemBase;

		const elemNome = document.createElement('span');
		elemNome.id = 'popup-'+this.nome+'n';
		if (!part.noName) elemNome.appendChild(document.createTextNode(this.display));
		this.element.nome = elemNome;
		elemBase.appendChild(elemNome);

		const elemValue = document.createElement(!part.elemIsBase ? part.elem : 'span');
		if (part.elem === 'input' || part.elem === 'select') {
			elemValue.name = this.nome;
		}
		elemValue.id = 'popup-'+this.nome+'v';
		if (part.nameInside) elemValue.appendChild(document.createTextNode(this.display));
		if (part.valueInside) elemValue.appendChild(document.createTextNode(this.value));
		elemValue.value = part.format !== undefined ? part.format(this.value) : this.value;
		this.element.value = elemValue;
		elemBase.appendChild(elemValue);

		if (this.tipo === PART_BOTAO) { 
			elemValue.addEventListener('click', () => {
				if (typeof this.value === 'function') { this.value(this); } });
		} else if (this.tipo === PART_DROP) {
			const buffer = bufferCtx;
			
			const fallback = document.createElement('option');
			fallback.value = null; 
			fallback.appendChild(document.createTextNode(this.conteudo.fallback || '--'));
			elemValue.appendChild(fallback);
			
			elemValue.required = true;
			elemValue.onchange = event => {
				this.value = elemValue.value;
			}

			for (const i in buffer) {
				if (!this.conteudo.listaDe[i]) continue;
				const collection = buffer[i];
				for (const j in collection) {
					const item = collection[j];
					const option = document.createElement('option');
					option.value = item._id['$oid'];
					option.appendChild(document.createTextNode(item[this.conteudo.prop] || '！】Propriedade não encontrada.'));
					elemValue.appendChild(option);
					if (saved && item._id['$oid'] === bufferSave [saveSlot] [nome] ['$oid']) {
						elemValue.value = bufferSave [saveSlot] [nome] ['$oid'];
						this.value = elemValue.value;
					}
				}
			}

			if (typeof value === 'function') value = value();
			if (typeof value === 'object' && value['$oid'] !== undefined) {
				elemValue.value = value['$oid'];
				this.value = value['$oid'];
			}
		} else if (this.tipo === PART_TIME) {
			elemValue.type = 'datetime-local';
			elemValue.onchange = event => {
				this.value = new Date(elemValue.value).getTime();
			}
			if (saved) {
				this.value = new Date(bufferSave[saveSlot][nome]['$date']['$numberLong']);
				elemValue.value = `${this.value.toJSON().slice(0,10)}T${this.value.toTimeString().slice(0,8)}`;
				this.value = this.value.getTime();
				delete bufferSave [saveSlot] [nome];
			}
			if (typeof value === 'function') value = value();
			if (typeof value === 'object' && value['$date'] !== undefined) {
				this.value = new Date(value['$date']['$numberLong'] || Date.now());
				elemValue.value = `${this.value.toJSON().slice(0,10)}T${this.value.toTimeString().slice(0,8)}`;
				this.value = this.value.getTime();
			}
		} else {
			// if (part.format) elemValue.value = part.format(this.value);
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

		bufferSave [slot] [this.nome] = this.tipo === PART_TIME
			? {['$date']:{['$numberLong']:new Date(this.value).getTime()}}
			: this.tipo === PART_DROP
				? {['$oid']:this.value}
				: this.value;
	}

	remove () {
		this.element.base.remove();
		delete this.element;
	}
}
