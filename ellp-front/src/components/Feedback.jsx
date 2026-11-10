import './Feedback.css';

export function Feedback({ mensagem, tipo = 'erro' }) {
	if (!mensagem) {
		return null;
	}

	return (
		<p className={`feedback-mensagem ${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
			{mensagem}
		</p>
	);
}
