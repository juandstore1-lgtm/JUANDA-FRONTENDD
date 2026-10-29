import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { calls, respondWith, json, authHeader, reset } from './setup.ts';
import {
  ApiError,
  ACCESS_DENIED_MESSAGE,
  SESSION_EXPIRED_EVENT,
  SESSION_EXPIRED_MESSAGE,
  ContestService,
  ProductService,
  TicketService
} from '../src/services/api.ts';

const TOKEN = 'token-de-prueba';
const buyer = { id: 401, name: 'Ana Compradora', phone: '3000000000', email: 'ana@x.com', paymentStatus: 'PENDING' };

const login = () => {
  localStorage.setItem('jwt_token', TOKEN);
  localStorage.setItem('admin_user', JSON.stringify({ id: '1', role: { name: 'GLOBAL_ADMIN' } }));
};

const countExpiredEvents = () => {
  let count = 0;
  window.addEventListener(SESSION_EXPIRED_EVENT, () => count++);
  return () => count;
};

beforeEach(reset);

// ---------- Endpoints de administración nuevos ----------

test('dashboard de rifas: usa /tickets/admin con el token y recibe los compradores', async () => {
  login();
  respondWith(() => json([
    { id: 501, raffleId: 301, ticketNumber: '00', status: 'RESERVED', buyer },
    { id: 502, raffleId: 301, ticketNumber: '01', status: 'AVAILABLE', buyer: null }
  ]));

  const tickets = await TicketService.getTicketsWithBuyers('301');

  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /\/raffles\/301\/tickets\/admin$/);
  assert.equal(authHeader(calls[0]), `Bearer ${TOKEN}`);
  assert.equal(tickets[0].id, '501');
  assert.equal(tickets[0].raffleId, '301');
  assert.deepEqual(tickets[0].buyer, buyer);
});

test('vista pública de boletos: endpoint público, sin token y sin datos del comprador', async () => {
  login();
  respondWith(() => json([{ id: 501, raffleId: 301, ticketNumber: '00', status: 'RESERVED', buyer: null }]));

  const tickets = await TicketService.getTicketsByRaffle('301');

  assert.match(calls[0].url, /\/raffles\/301\/tickets$/);
  assert.equal(authHeader(calls[0]), undefined);
  assert.equal(tickets[0].buyer, null);
});

test('ganador en administración: usa /contests/admin/{id}/winner con el token', async () => {
  login();
  const winner = { id: 801, selectedAt: '2026-10-01T10:00:00', participant: { id: 701, fullName: 'Ganadora', email: 'g@x.com', phone: '311' } };
  respondWith(() => json(winner));

  const result = await ContestService.getWinner(601);

  assert.match(calls[0].url, /\/contests\/admin\/601\/winner$/);
  assert.equal(authHeader(calls[0]), `Bearer ${TOKEN}`);
  assert.equal(result?.participant.email, 'g@x.com');
  assert.equal(result?.participant.phone, '311');
});

test('ganador en administración: sin ganador (cuerpo vacío o null) devuelve null', async () => {
  login();
  respondWith(() => new Response('', { status: 200 }));
  assert.equal(await ContestService.getWinner(601), null);

  respondWith(() => json(null));
  assert.equal(await ContestService.getWinner(601), null);
});

test('ganador en administración: un 403 se propaga como acceso denegado sin cerrar la sesión', async () => {
  login();
  respondWith(() => json({ error: 'Acceso denegado' }, 403));

  await assert.rejects(ContestService.getWinner(601), (e: any) => e instanceof ApiError && e.status === 403 && e.message === 'Acceso denegado');
  assert.equal(localStorage.getItem('jwt_token'), TOKEN);
});

// ---------- 401 / 403 / otros errores ----------

test('401 con token: limpia la sesión, avisa una sola vez y devuelve el mensaje de sesión expirada', async () => {
  login();
  const expiredEvents = countExpiredEvents();
  respondWith(() => json({ error: 'Autenticación requerida' }, 401));

  // Dos peticiones simultáneas fallan: solo debe haber un aviso
  const results = await Promise.allSettled([TicketService.getTicketsWithBuyers('301'), ContestService.getWinner(601)]);

  for (const r of results) {
    assert.equal(r.status, 'rejected');
    const err = (r as PromiseRejectedResult).reason;
    assert.ok(err instanceof ApiError);
    assert.equal(err.status, 401);
    assert.equal(err.message, SESSION_EXPIRED_MESSAGE);
  }
  assert.equal(localStorage.getItem('jwt_token'), null);
  assert.equal(localStorage.getItem('admin_user'), null);
  assert.equal(expiredEvents(), 1);
});

test('403: conserva el token y el mensaje del backend; sin cuerpo usa un mensaje claro', async () => {
  login();
  const expiredEvents = countExpiredEvents();

  respondWith(() => json({ error: 'Acceso denegado' }, 403));
  await assert.rejects(ProductService.deleteProduct('102'), { message: 'Acceso denegado' });

  respondWith(() => new Response('', { status: 403 }));
  await assert.rejects(ProductService.deleteProduct('102'), { message: ACCESS_DENIED_MESSAGE });

  assert.equal(localStorage.getItem('jwt_token'), TOKEN);
  assert.equal(expiredEvents(), 0);
});

test('error 500, error de validación y error de red no borran el token', async () => {
  login();
  const expiredEvents = countExpiredEvents();

  respondWith(() => json({ error: 'An unexpected error occurred' }, 500));
  await assert.rejects(ProductService.deleteProduct('101'), (e: any) => e.status === 500);

  respondWith(() => json({ name: 'must not be blank' }, 400));
  await assert.rejects(ProductService.deleteProduct('101'), (e: any) => e.status === 400);

  respondWith(() => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(ProductService.deleteProduct('101'), TypeError);

  assert.equal(localStorage.getItem('jwt_token'), TOKEN);
  assert.equal(expiredEvents(), 0);
});

test('errores de negocio y genéricos con formato {"error": "..."} llegan íntegros a la interfaz', async () => {
  login();
  respondWith(() => json({ error: 'Ticket 00 is no longer available' }, 400));
  await assert.rejects(TicketService.approveTicket('301', '501'), { message: 'Ticket 00 is no longer available' });

  respondWith(() => json({ error: 'No se pudo guardar la información enviada' }, 400));
  await assert.rejects(ProductService.updateProduct('101', { name: 'x' }), { message: 'No se pudo guardar la información enviada' });

  respondWith(() => json({ error: 'Solicitud no válida' }, 400));
  await assert.rejects(ProductService.updateProduct('101', { name: 'x' }), { message: 'Solicitud no válida' });

  // Sin cuerpo JSON: mensaje genérico con el código, sin detalles internos
  respondWith(() => new Response('<html>boom</html>', { status: 502 }));
  await assert.rejects(ProductService.updateProduct('101', { name: 'x' }), { message: 'Error (502): No se pudo completar la solicitud' });
});

// ---------- Páginas públicas con token expirado ----------

test('página pública con token expirado: el backend la trata como anónima y la sesión no se toca', async () => {
  localStorage.setItem('jwt_token', 'token-expirado');
  const expiredEvents = countExpiredEvents();
  respondWith(() => json([{ id: 101, name: 'Camiseta', storeIds: [11] }]));

  const products = await ProductService.getProducts();

  assert.equal(products.length, 1);
  assert.deepEqual(products[0].storeIds, ['11']);
  assert.equal(expiredEvents(), 0);
});

test('compra de boletos: sigue sin enviar token y su 401 no cierra la sesión del administrador', async () => {
  login();
  const expiredEvents = countExpiredEvents();
  respondWith(() => json({ error: 'Autenticación requerida' }, 401));

  await assert.rejects(
    TicketService.purchaseTickets('301', { ticketIds: ['502'], buyer: { name: 'A', phone: '1', email: '' } }),
    (e: any) => e instanceof ApiError && e.status === 401 && e.message === 'Autenticación requerida'
  );
  assert.equal(authHeader(calls[0]), undefined);
  assert.equal(localStorage.getItem('jwt_token'), TOKEN);
  assert.equal(expiredEvents(), 0);
});

test('compra pública: sin JWT aunque haya sesión, sin CAPTCHA y devuelve la reserva (no una venta)', async () => {
  login();
  respondWith(() => json({ raffleId: 301, ticketIds: [502, 503], ticketNumbers: ['01', '02'], status: 'RESERVED', reservedUntil: '2026-10-29T17:15:00Z' }));

  const reservation = await TicketService.purchaseTickets('301', {
    ticketIds: ['503', '502'],
    buyer: { name: 'Laura', phone: '3001234567', email: '' }
  });

  assert.match(calls[0].url, /\/raffles\/301\/tickets\/purchase$/);
  assert.equal(calls[0].init?.method, 'POST');
  assert.equal(authHeader(calls[0]), undefined);
  // Solo boletos y comprador: ningún token de servicios externos
  assert.deepEqual(JSON.parse(String(calls[0].init?.body)), {
    ticketIds: [503, 502],
    buyer: { name: 'Laura', phone: '3001234567', email: '' }
  });
  assert.deepEqual(reservation, {
    raffleId: '301', ticketIds: ['502', '503'], ticketNumbers: ['01', '02'], status: 'RESERVED', reservedUntil: '2026-10-29T17:15:00Z'
  });
});

test('compra pública: boleto ocupado, límite de solicitudes y compra no disponible llegan con el mensaje del backend', async () => {
  const request = { ticketIds: ['502'], buyer: { name: 'Laura', phone: '3001234567', email: '' } };
  respondWith(() => json({ error: 'Ticket 01 is no longer available' }, 400));
  await assert.rejects(TicketService.purchaseTickets('301', request), { message: 'Ticket 01 is no longer available' });

  respondWith(() => json({ error: 'Demasiadas solicitudes. Intenta de nuevo en unos minutos.' }, 429));
  await assert.rejects(TicketService.purchaseTickets('301', request), (e: any) => e.status === 429 && /Demasiadas/.test(e.message));

  respondWith(() => json({ error: 'La compra en línea no está disponible en este momento' }, 503));
  await assert.rejects(TicketService.purchaseTickets('301', request), (e: any) => e.status === 503);
});

test('aprobar y cancelar envían el comprador que muestra el panel', async () => {
  login();
  respondWith(() => new Response('', { status: 200 }));
  await TicketService.approveTicket('301', '501', '401');
  await TicketService.cancelTicket('301', '502', '402');
  await TicketService.approveTicket('301', '503');

  assert.match(calls[0].url, /\/raffles\/301\/tickets\/501\/approve\?buyerId=401$/);
  assert.match(calls[1].url, /\/raffles\/301\/tickets\/502\/cancel\?buyerId=402$/);
  assert.match(calls[2].url, /\/raffles\/301\/tickets\/503\/approve$/);
  assert.ok(calls.every((c) => authHeader(c) === `Bearer ${TOKEN}`));
});

// ---------- getActiveContest ----------

test('getActiveContest: devuelve el concurso activo del endpoint público', async () => {
  respondWith(() => json({ id: 601, name: 'Outfit', status: 'ACTIVE', showInMenu: true }));

  const contest = await ContestService.getActiveContest();

  assert.equal(contest?.id, 601);
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /\/contests\/public\/active$/);
});

test('getActiveContest: sin concurso activo devuelve null y nunca consulta endpoints de administración', async () => {
  for (const response of [() => new Response('', { status: 200 }), () => json(null), () => json({ error: 'x' }, 500)]) {
    reset();
    respondWith(response);
    assert.equal(await ContestService.getActiveContest(), null);
    assert.ok(calls.every((c) => !c.url.includes('/contests/admin')), calls.map((c) => c.url).join(', '));
  }

  reset();
  respondWith(() => { throw new TypeError('Failed to fetch'); });
  assert.equal(await ContestService.getActiveContest(), null);
});
