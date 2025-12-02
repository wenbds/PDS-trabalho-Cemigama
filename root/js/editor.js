import popup, * as handler from '../js/popup.js';
const body = document.querySelector('body');

export function throwFunctFactory (tipo, titulo) {
	return function (str) {
		const thisPopup = new popup(handler[tipo], titulo, str);
		popup.pop(body);
	};
}
export const throwErro  = throwFunctFactory (handler.TIPO_ERRO, 'Erro');
export const throwAviso = throwFunctFactory (handler.TIPO_AVISO, 'Aviso');

class editAPI {
	popup;
	jáPronto = {
		adicionar: [
			"Adicionar material",
			"Preencha todos os campos descrevendo o material a ser adicionado.",
			true,
			[
				[[handler.PART_INPUT,'nome','Nome do material','']],
				[[handler.PART_INPUT,'tipo','Tipo de material','']],
				[[handler.PART_INPUT,'distribuidora','Distribuidora','']],
				[[handler.PART_MONEY,'precoUni','Preço unitário (R$)',0]],
				[[handler.PART_MONEY,'custoUni','Custo unitário (R$)',0]],
				[[handler.PART_NUMERO,'estoq','Estoque atual',0]],
				[[handler.PART_NUMERO,'estoqMinimo','Estoque mínimo',0]],
				[[handler.PART_DIVISN,'div0']],
				[[handler.PART_BOTAO,'btCriar','Adicionar',0],
				 [handler.PART_BOTAO,'btCancelar','Cancelar',0]]
			]
		]
	};

	open (title, msg, partes) {
		this.popup = new popup(handler.TIPO_NORMAL, title, msg, partes);
		this.popup.modal = true;
		this.popup.pop(body);
		return this.popup;
	}
	openPronto (index) {
		const lista = this.jáPronto[index];
		if (!lista) {
			throwErro('Lista não existe no índice: '+index.toString());
		}
		this.open(lista[0],lista[1],lista[3]);
		this.popup.modalSave = lista[2];
	}
}

export default new editAPI();
