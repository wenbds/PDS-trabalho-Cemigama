import { default as fator, generico } from './fator.js';
export default class grafico extends generico {
	constructor (modo,i,label) {
		super(modo,i,label, 2);
	}

	render () {
		this.labelize();
	}
}
