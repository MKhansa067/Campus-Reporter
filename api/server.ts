type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
}

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

export default async function handler(req: any, res: any) {
  try {
    const startHandler = await getServerEntry();

    const host = req.headers.host || 'localhost';
    const url = new URL(req.url, `http://${host}`);

    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers || {})) {
      if (value !== undefined) {
        headers[key] = Array.isArray(value) ? value.join(', ') : String(value);
      }
    }

    let body: Buffer | undefined;
    if (req.method && !['GET', 'HEAD'].includes(req.method)) {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(Buffer.from(chunk as any));
      }
      body = Buffer.concat(chunks);
    }

    const request = new Request(url.toString(), {
      method: req.method || 'GET',
      headers,
      body,
    });

    const response = await startHandler.fetch(request);

    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));

    if (response.body) {
      for await (const chunk of response.body as any) {
        res.write(chunk);
      }
    }
    res.end();
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'content-type': 'text/plain' });
    res.end('Internal Server Error');
  }
}
