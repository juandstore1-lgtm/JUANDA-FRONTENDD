import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateBuyer, unavailableSelection } from '../src/utils/purchase.ts';

const ok = { name: 'Laura Gómez', phone: '+57 300 123 4567', email: '' };

test('datos válidos: sin errores (el correo es opcional)', () => {
  assert.deepEqual(validateBuyer(ok), {});
  assert.deepEqual(validateBuyer({ ...ok, phone: '(300) 123-4567', email: 'laura@correo.com' }), {});
});

test('mismas reglas que el backend para nombre, teléfono y correo', () => {
  for (const name of ['', ' ', 'A', '<script>', "x'); DROP TABLE buyers;--", 'a'.repeat(101)]) {
    assert.ok(validateBuyer({ ...ok, name }).name, name);
  }
  for (const phone of ['', '123', '300abc4567', '1234567890123456']) {
    assert.ok(validateBuyer({ ...ok, phone }).phone, phone);
  }
  for (const email of ['sin-arroba', 'a@b', 'a b@c.com']) {
    assert.ok(validateBuyer({ ...ok, email }).email, email);
  }
});

test('detecta los boletos seleccionados que otra persona reservó', () => {
  const fresh = [
    { id: '1', ticketNumber: '00', status: 'AVAILABLE' },
    { id: '2', ticketNumber: '01', status: 'RESERVED' },
    { id: '3', ticketNumber: '02', status: 'SOLD' }
  ];
  assert.deepEqual(unavailableSelection(['1', '2', '3'], fresh).map((t) => t.ticketNumber), ['01', '02']);
  assert.deepEqual(unavailableSelection(['1'], fresh), []);
});
