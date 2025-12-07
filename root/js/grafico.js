import { default as fator, generico } from './fator.js';

export default class grafico extends generico {
	context;
	constructor (modo,i,label) {
		super(modo,i,label, 2);
		this.context = this.elemValue.getContext('2d');
	}

	// Vinicius
	// 5/12/2025
	render (ctx) {
		this.labelize();
		const bd = ctx.bd;
		const valores = bd[0] || [];

		const c = this.context;
		c.clearRect(0, 0, this.elemValue.width, this.elemValue.height);

		const largura = 40;
		const espacamento = 20;
		const alturaMaxima = 150;
		const base = 200;

		const maiorValor = Math.max(...valores, 1);

		for (let i = 0; i < valores.length; i++) {
			const valor = valores[i];
			const altura = (valor / maiorValor) * alturaMaxima;
			const x = 50 + i * (largura + espacamento);
			const y = base - altura;

			c.fillStyle = "#3b82f6";
			c.fillRect(x, y, largura, altura);

			c.fillStyle = "#000";
			c.font = "14px Arial";
			c.fillText(valor, x + 5, y - 5);
		}
	}
}
