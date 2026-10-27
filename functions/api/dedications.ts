interface D1Statement {
	bind(...values: (string | number)[]): D1Statement;
	all<T>(): Promise<{ results: T[] }>;
	run(): Promise<unknown>;
}

interface DedicationsEnv {
	DB: { prepare(query: string): D1Statement };
}

interface PagesFunctionContext {
	request: Request;
	env: DedicationsEnv;
}

type DedicationRow = {
	id: string;
	name: string;
	message: string;
	color_index: number;
	font_index: number;
	created_at: string;
};

const json = (payload: unknown, status = 200) =>
	new Response(JSON.stringify(payload), {
		status,
		headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
	});

export async function onRequestGet({ env }: PagesFunctionContext) {
	try {
		const { results } = await env.DB.prepare(
			'SELECT id, name, message, color_index, font_index, created_at FROM dedications ORDER BY created_at DESC',
		).all<DedicationRow>();
		return json({ dedications: results.map((row) => ({
			id: row.id,
			name: row.name,
			message: row.message,
			color: row.color_index,
			font: row.font_index,
			createdAt: row.created_at,
		})) });
	} catch {
		return json({ error: 'No pudimos cargar las dedicatorias.' }, 500);
	}
}

export async function onRequestPost({ request, env }: PagesFunctionContext) {
	const origin = request.headers.get('Origin');
	if (origin && origin !== new URL(request.url).origin) return json({ error: 'Solicitud no válida.' }, 403);
	const contentLength = Number(request.headers.get('Content-Length') ?? 0);
	if (contentLength > 4096) return json({ error: 'El mensaje es demasiado largo.' }, 413);

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'No pudimos leer el mensaje.' }, 400);
	}
	if (!body || typeof body !== 'object') return json({ error: 'Formato de mensaje no válido.' }, 400);
	const fields = body as { name?: unknown; message?: unknown; website?: unknown };

	// Campo trampa para bots: responde como enviado, pero no persiste contenido automatizado.
	if (typeof fields.website === 'string' && fields.website.trim()) {
		return json({ dedication: { id: crypto.randomUUID(), name: 'Un deseo para Claudia y Juan', message: 'Gracias por compartir este recuerdo.', color: 0, font: 0 } }, 201);
	}
	const name = typeof fields.name === 'string' ? fields.name.trim().replace(/\s+/g, ' ') : '';
	const message = typeof fields.message === 'string' ? fields.message.trim() : '';
	if (!name || name.length > 48 || !message || message.length > 240) {
		return json({ error: 'Revisa el nombre y la dedicatoria antes de enviarlos.' }, 400);
	}

	const color = crypto.getRandomValues(new Uint8Array(1))[0] % 4;
	const font = crypto.getRandomValues(new Uint8Array(1))[0] % 3;
	const id = crypto.randomUUID();
	const createdAt = new Date().toISOString();
	try {
		await env.DB.prepare(
			'INSERT INTO dedications (id, name, message, color_index, font_index, created_at) VALUES (?, ?, ?, ?, ?, ?)',
		).bind(id, name, message, color, font, createdAt).run();
		return json({ dedication: { id, name, message, color, font, createdAt } }, 201);
	} catch {
		return json({ error: 'No pudimos guardar el mensaje. Inténtalo de nuevo.' }, 500);
	}
}
