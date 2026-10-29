// Entorno mínimo de navegador para probar src/services en Node (sin dependencias nuevas)

export type FetchCall = { url: string; init?: RequestInit };

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string) { return this.data.has(key) ? this.data.get(key)! : null; }
  setItem(key: string, value: string) { this.data.set(key, String(value)); }
  removeItem(key: string) { this.data.delete(key); }
  clear() { this.data.clear(); }
}

(globalThis as any).localStorage = new MemoryStorage();
(globalThis as any).window = new EventTarget();

export const calls: FetchCall[] = [];
let responder: (call: FetchCall) => Response | Promise<Response> = () => new Response('', { status: 200 });

(globalThis as any).fetch = async (url: string, init?: RequestInit) => {
  const call = { url: String(url), init };
  calls.push(call);
  return responder(call);
};

export const respondWith = (fn: (call: FetchCall) => Response | Promise<Response>) => { responder = fn; };

export const json = (body: unknown, status = 200) =>
  new Response(body === undefined ? '' : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const authHeader = (call: FetchCall) => (call.init?.headers as Record<string, string> | undefined)?.Authorization;

export const reset = () => {
  calls.length = 0;
  localStorage.clear();
  respondWith(() => new Response('', { status: 200 }));
};
