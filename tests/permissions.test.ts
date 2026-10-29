import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canManageProduct, canManageCategory } from '../src/utils/permissions.ts';
import { User } from '../src/types/index.ts';

// Mismos casos que SecurityAuthorizationTest del backend: sedes 11 y 12
const user = (role: 'GLOBAL_ADMIN' | 'STORE_ADMIN', storeIds: string[]): User => ({
  id: '1', name: 'x', email: 'x@x.com', role: { id: 'r', name: role }, storeIds, isActive: true
});

const global = user('GLOBAL_ADMIN', []);
const norte = user('STORE_ADMIN', ['11']);
const ambas = user('STORE_ADMIN', ['11', '12']);

test('productos: GLOBAL_ADMIN gestiona todos', () => {
  for (const storeIds of [['11'], ['12'], ['11', '12'], []]) {
    assert.equal(canManageProduct(global, { storeIds }), true, JSON.stringify(storeIds));
  }
});

test('productos: STORE_ADMIN solo gestiona los que pertenecen únicamente a sus sedes', () => {
  assert.equal(canManageProduct(norte, { storeIds: ['11'] }), true);
  assert.equal(canManageProduct(norte, { storeIds: ['12'] }), false);
  assert.equal(canManageProduct(norte, { storeIds: ['11', '12'] }), false, 'compartido con otra sede');
  assert.equal(canManageProduct(norte, { storeIds: [] }), false, 'sin sede');
  assert.equal(canManageProduct(ambas, { storeIds: ['11', '12'] }), true);
});

test('productos: sin usuario no hay acciones', () => {
  assert.equal(canManageProduct(null, { storeIds: ['11'] }), false);
});

test('categorías: GLOBAL_ADMIN todas; STORE_ADMIN solo las de sus sedes, nunca las globales', () => {
  assert.equal(canManageCategory(global, { storeId: undefined }), true);
  assert.equal(canManageCategory(global, { storeId: '12' }), true);
  assert.equal(canManageCategory(norte, { storeId: '11' }), true);
  assert.equal(canManageCategory(norte, { storeId: '12' }), false);
  assert.equal(canManageCategory(norte, { storeId: undefined }), false, 'categoría global');
  assert.equal(canManageCategory(null, { storeId: '11' }), false);
});
