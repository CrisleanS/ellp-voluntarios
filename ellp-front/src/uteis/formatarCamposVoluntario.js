export function apenasDigitos(valor) {
	return valor.replace(/\D/g, '');
}

export function formatarCpf(valor) {
	const digitos = apenasDigitos(valor).slice(0, 11);
	return digitos
		.replace(/^(\d{3})(\d)/, '$1.$2')
		.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
		.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, '$1.$2.$3-$4');
}

export function formatarTelefone(valor) {
	const digitos = apenasDigitos(valor).slice(0, 11);
	if (digitos.length <= 2) {
		return digitos;
	}

	const tamanhoPrefixo = digitos.length > 10 ? 5 : 4;
	return `${digitos.slice(0, 2)} ${digitos.slice(2, 2 + tamanhoPrefixo)} ${digitos.slice(2 + tamanhoPrefixo)}`.trimEnd();
}

export function validarCpf(valor) {
	const cpf = apenasDigitos(valor);
	if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
		return false;
	}

	for (let posicao = 9; posicao <= 10; posicao += 1) {
		let soma = 0;
		for (let indice = 0; indice < posicao; indice += 1) {
			soma += Number(cpf[indice]) * (posicao + 1 - indice);
		}
		const resto = (soma * 10) % 11;
		const digito = resto === 10 ? 0 : resto;
		if (digito !== Number(cpf[posicao])) {
			return false;
		}
	}

	return true;
}

export function validarEmail(valor) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());
}

export function validarTelefone(valor) {
	const digitos = apenasDigitos(valor);
	const ddds = new Set([
		'11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '22', '24',
		'27', '28', '31', '32', '33', '34', '35', '37', '38', '41', '42', '43',
		'44', '45', '46', '47', '48', '49', '51', '53', '54', '55', '61', '62',
		'63', '64', '65', '66', '67', '68', '69', '71', '73', '74', '75', '77',
		'79', '81', '82', '83', '84', '85', '86', '87', '88', '89', '91', '93',
		'94', '95', '96', '97', '98', '99',
	]);
	return (digitos.length === 10 || digitos.length === 11) && ddds.has(digitos.slice(0, 2));
}

export function validarDataNascimento(valor) {
	if (!valor) {
		return false;
	}
	const data = new Date(`${valor}T00:00:00`);
	return !Number.isNaN(data.getTime()) && data < new Date(new Date().toDateString());
}
