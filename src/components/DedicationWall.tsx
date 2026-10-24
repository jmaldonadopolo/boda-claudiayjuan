import { useEffect, useState } from 'preact/hooks';
import './dedication-wall.css';

type Dedication = {
	id: string;
	name: string;
	message: string;
	color: number;
	font: number;
	createdAt?: string;
	sample?: boolean;
};

const example: Dedication = {
	id: 'example-note',
	name: 'Un deseo para Claudia y Juan',
	message: 'Que cada día les encuentre tomados de la mano y rodeados de quienes más quieren.',
	color: 0,
	font: 0,
	sample: true,
};

export default function DedicationWall() {
	const [dedications, setDedications] = useState<Dedication[]>([example]);
	const [message, setMessage] = useState('');
	const [status, setStatus] = useState('');
	const [isSending, setIsSending] = useState(false);

	useEffect(() => {
		const controller = new AbortController();
		fetch('/api/dedications', { signal: controller.signal, headers: { Accept: 'application/json' } })
			.then(async (response) => {
				if (!response.ok) return;
				const result = (await response.json()) as { dedications?: Dedication[] };
				if (result.dedications) setDedications([example, ...result.dedications]);
			})
			.catch(() => undefined);
		return () => controller.abort();
	}, []);

	const submit = async (event: SubmitEvent) => {
		event.preventDefault();
		const form = event.currentTarget;
		if (!(form instanceof HTMLFormElement) || !form.reportValidity() || isSending) return;
		const fields = new FormData(form);
		const name = String(fields.get('name') ?? '').trim();
		const cleanMessage = String(fields.get('message') ?? '').trim();
		if (!name || !cleanMessage) return;

		setIsSending(true);
		setStatus('');
		try {
			const response = await fetch('/api/dedications', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
				body: JSON.stringify({ name, message: cleanMessage, website: fields.get('website') }),
			});
			if (!response.ok) throw new Error('No se pudo guardar el mensaje.');
			const result = (await response.json()) as { dedication: Dedication };
			setDedications((current) => [result.dedication, ...current].slice(0, 25));
			form.reset();
			setMessage('');
			setStatus('Tu mensaje ya forma parte de esta historia. Gracias por compartirlo.');
		} catch {
			setStatus('No pudimos guardar el mensaje ahora. Inténtalo de nuevo en un momento.');
		} finally {
			setIsSending(false);
		}
	};

	return (
		<div class="dedication-island">
			<form class="dedication-form" onSubmit={submit}>
				<label for="guest-name">Tu nombre</label>
				<input id="guest-name" name="name" autoComplete="name" maxLength={48} placeholder="¿Quién les escribe?" required />
				<label for="guest-message">Tu dedicatoria</label>
				<textarea id="guest-message" name="message" rows={4} maxLength={240} placeholder="Escribe un deseo para ellos…" required value={message} onInput={(event) => setMessage((event.currentTarget as HTMLTextAreaElement).value)} />
				<input class="dedication-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
				<div class="form-footer"><span>{message.length} / 240</span><button type="submit" disabled={isSending}>{isSending ? 'Guardando…' : 'Dejar mi mensaje'} <span aria-hidden="true">↗</span></button></div>
				<p class="form-confirmation" role="status" aria-live="polite">{status}</p>
			</form>
			<div class="dedication-board" aria-label="Dedicatorias para Claudia y Juan" aria-live="polite">
				<div class="dedication-board-heading"><span>Palabras que quedan</span><i aria-hidden="true">✳</i></div>
				<div class="wish-list">
					{dedications.map((dedication, index) => (
						<article class={`wish-card wish-card--color-${dedication.color} wish-card--font-${dedication.font} wish-card--offset-${index % 3}`} key={dedication.id}>
							<span class="wish-note-tape" aria-hidden="true"></span>
							<p class="wish-message">“{dedication.message}”</p>
							<span class="wish-author">— {dedication.name}</span>
							{dedication.sample && <span class="wish-sample-label">Un ejemplo</span>}
						</article>
					))}
				</div>
			</div>
		</div>
	);
}
