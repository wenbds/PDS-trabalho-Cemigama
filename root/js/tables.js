import { default as fator, generico } from './fator.js';
export default class table extends generico {
	/*
	 Variável `trackers` se refere à lista de propriedades
	 que serão retiradas do banco de dados.
	 
	 ex.:
	 new table(2,0,'Produtos Cadastrados', [
		{nome:'Produto',total:false,get:function(this) return this.nome end},
		{nome:'Distribuidora',total:false,get:function(this) return this.distribuidora end},
		{nome:'Data',total:false,get:function(this) return this.data end},
		{nome:'Quantidade',total:true,get:function(this) return this.estoq end},
		{nome:'Custo Unitário (R$)',total:true,get:function(this) return this.custoUni end},
		{nome:'Valor Total (R$)',total:true,get:function(this) return this.custoUni * this.estoq end},
	 ])
	 */
	trackers = [];
	constructor (modo,i, label, trackers) {
		super(modo,i, label, 1);
	}
}

export class combarra extends generico {
	constructor (modo,i, label, collection) {
		super(modo,i, label, 3);
	}
}
