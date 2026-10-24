import { useEffect, useRef, useState } from 'preact/hooks';
import './dedication-wall.css';

type Dedication = {
	id: string;
	name: string;
	message: string;
	color: number;
	font: number;
	createdAt?: string;
};

const previewDedications: Dedication[] = [
	{ id: 'preview-01', name: 'Rosa', message: 'Que este nuevo capítulo les regale la misma alegría que ustedes han compartido con todos nosotros.', color: 0, font: 0 },
	{ id: 'preview-02', name: 'Ana y Luis', message: 'Qué bonito celebrar un amor que ha crecido con paciencia, ternura y tanta complicidad.', color: 1, font: 1 },
	{ id: 'preview-03', name: 'María Elena', message: 'Les deseamos días tranquilos, muchas risas y un abrazo siempre dispuesto al final de cada jornada.', color: 2, font: 2 },
	{ id: 'preview-04', name: 'Los primos', message: 'Su historia nos recuerda que el cariño se construye en los pequeños gestos de cada día.', color: 3, font: 0 },
	{ id: 'preview-05', name: 'Sofía', message: 'Que Dios bendiga esta promesa y acompañe cada paso que den juntos.', color: 0, font: 1 },
	{ id: 'preview-06', name: 'Carlos', message: 'Con mucho cariño, les deseo una vida llena de salud, paz y momentos para atesorar.', color: 2, font: 0 },
	{ id: 'preview-07', name: 'Familia Rojas', message: 'Hoy celebramos todo el amor que han sembrado y la alegría de verlos llegar hasta aquí.', color: 1, font: 2 },
	{ id: 'preview-08', name: 'Patricia', message: 'Que nunca les falte una conversación larga, una mesa compartida y motivos para sonreír.', color: 3, font: 1 },
	{ id: 'preview-09', name: 'Andrés', message: 'Un abrazo grande para los dos. Que su hogar siga siendo ese lugar lleno de cariño.', color: 0, font: 2 },
	{ id: 'preview-10', name: 'Tía Carmen', message: 'Después de tantos años juntos, qué emoción verlos celebrar este sí tan esperado. Los quiero mucho.', color: 2, font: 1 },
	{ id: 'preview-11', name: 'Valeria y Mateo', message: 'Que cada recuerdo nuevo sea tan bonito como todos los que ya han construido.', color: 1, font: 0 },
	{ id: 'preview-12', name: 'Daniela', message: 'Les deseo una celebración inolvidable y muchos años más caminando de la mano.', color: 3, font: 2 },
	{ id: 'preview-13', name: 'Jorge', message: 'Gracias por enseñarnos que el amor también es estar, cuidar y elegir compartir la vida.', color: 0, font: 1 },
	{ id: 'preview-14', name: 'Nicolás', message: 'Toda la felicidad del mundo para ustedes en este día tan especial y en los que vienen.', color: 2, font: 2 },
	{ id: 'preview-15', name: 'Con cariño, la familia', message: 'Que la dicha de hoy les acompañe siempre. Los queremos y celebramos con todo el corazón.', color: 1, font: 1 },
];

const makeLocalDedication = (name: string, message: string): Dedication => ({
	id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
	name,
	message,
	color: Math.floor(Math.random() * 4),
	font: Math.floor(Math.random() * 3),
});

export default function DedicationWall() {
	const [dedications, setDedications] = useState<Dedication[]>(() => import.meta.env.DEV ? previewDedications : []);
	const [message, setMessage] = useState('');
	const [status, setStatus] = useState('');
	const [isSending, setIsSending] = useState(false);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [isClosing, setIsClosing] = useState(false);
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		if (import.meta.env.DEV) return;
		const controller = new AbortController();
		fetch('/api/dedications', { signal: controller.signal, headers: { Accept: 'application/json' } })
			.then(async (response) => {
				if (!response.ok) return;
				const result = (await response.json()) as { dedications?: Dedication[] };
				if (result.dedications) setDedications(result.dedications);
			})
			.catch(() => undefined);
		return () => controller.abort();
	}, []);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (activeIndex !== null && !dialog.open) {
			setIsClosing(false);
			dialog.showModal();
		} else if (activeIndex === null && dialog.open) {
			dialog.close();
		}
	}, [activeIndex]);

	const closeLightbox = () => {
		if (activeIndex === null || isClosing) return;
		setIsClosing(true);
		window.setTimeout(() => setActiveIndex(null), 260);
	};
	const showNext = (direction: -1 | 1) => {
		setActiveIndex((current) => current === null ? null : (current + direction + dedications.length) % dedications.length);
	};

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
			if (import.meta.env.DEV) {
				setDedications((current) => [makeLocalDedication(name, cleanMessage), ...current]);
				form.reset();
				setMessage('');
				setStatus('Nota añadida a esta vista de prueba local.');
				return;
			}
			const response = await fetch('/api/dedications', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
				body: JSON.stringify({ name, message: cleanMessage, website: fields.get('website') }),
			});
			if (!response.ok) throw new Error('No se pudo guardar el mensaje.');
			const result = (await response.json()) as { dedication: Dedication };
			setDedications((current) => [result.dedication, ...current]);
			form.reset();
			setMessage('');
			setStatus('Tu mensaje ya forma parte de esta historia. Gracias por compartirlo.');
		} catch {
			setStatus('No pudimos guardar el mensaje ahora. Inténtalo de nuevo en un momento.');
		} finally {
			setIsSending(false);
		}
	};

	const activeDedication = activeIndex === null ? null : dedications[activeIndex];

	return (
		<div class="dedication-island">
			<div class="guestbook-copy">
				<p class="eyebrow" data-story-step>Unas palabras para Claudia y Juan</p>
				<h2 id="guestbook-title" data-story-step>Escríbeles<br /><em>con cariño.</em></h2>
				<p data-story-step>Un deseo, un recuerdo o un abrazo escrito. Cada mensaje será un regalo para guardar.</p>
			</div>
			<form class="dedication-form" onSubmit={submit}>
				<label for="guest-name">Tu nombre</label>
				<input id="guest-name" name="name" autoComplete="name" maxLength={48} placeholder="¿Quién les escribe?" required />
				<label for="guest-message">Tu dedicatoria</label>
				<textarea id="guest-message" name="message" rows={4} maxLength={240} placeholder="Escribe un deseo para ellos…" required value={message} onInput={(event) => setMessage((event.currentTarget as HTMLTextAreaElement).value)} />
				<input class="dedication-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
				<div class="form-footer"><span>{message.length} / 240</span><button type="submit" disabled={isSending}>{isSending ? 'Guardando…' : 'Dejar mi mensaje'} <span aria-hidden="true">↗</span></button></div>
				<p class="form-confirmation" role="status" aria-live="polite">{status}</p>
			</form>
			<div class="dedication-board" aria-label="Dedicatorias para Claudia y Juan">
				<div class="dedication-board-heading"><span>Palabras que quedan</span><i aria-hidden="true">✳</i></div>
				<div class="wish-list" aria-live="polite">
					{dedications.map((dedication, index) => (
						<article class={`wish-card wish-card--color-${dedication.color} wish-card--font-${dedication.font} wish-card--offset-${index % 5}`} key={dedication.id}>
							<span class="wish-note-tape" aria-hidden="true"></span>
							<button class="wish-card-trigger" type="button" onClick={() => setActiveIndex(index)} aria-label={`Leer dedicatoria de ${dedication.name}`}>
								<p class="wish-message">“{dedication.message}”</p>
								<span class="wish-author">{dedication.name}</span>
							</button>
						</article>
					))}
				</div>
			</div>
			<dialog ref={dialogRef} class={`dedication-lightbox${isClosing ? ' is-closing' : ''}`} aria-label="Dedicatoria ampliada" onClick={(event) => { if (event.target === event.currentTarget) closeLightbox(); }} onCancel={(event) => { event.preventDefault(); closeLightbox(); }} onKeyDown={(event) => { if (event.key === 'ArrowRight') showNext(1); if (event.key === 'ArrowLeft') showNext(-1); }}>
				{activeDedication && <div class={`lightbox-note wish-card--color-${activeDedication.color} wish-card--font-${activeDedication.font}`}>
					<span class="wish-note-tape" aria-hidden="true"></span>
					<button class="lightbox-close" type="button" onClick={closeLightbox} aria-label="Cerrar dedicatoria">×</button>
					<p class="lightbox-message">“{activeDedication.message}”</p>
					<span class="lightbox-author">{activeDedication.name}</span>
					<div class="lightbox-pagination">
						<button type="button" onClick={() => showNext(-1)} aria-label="Dedicatoria anterior">‹</button>
						<span>{activeIndex + 1} / {dedications.length}</span>
						<button type="button" onClick={() => showNext(1)} aria-label="Dedicatoria siguiente">›</button>
					</div>
				</div>}
			</dialog>
		</div>
	);
}
