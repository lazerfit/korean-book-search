// Run: pnpm test
import assert from 'node:assert';
import { firstItem, normalizeDate, type BookMetadata } from './yes24';

const book = { itemId: 1, title: '소년이 온다' } as BookMetadata;

assert.equal(firstItem({ success: true, errorCode: null, data: { items: [book] } }), book);
assert.equal(firstItem({ success: true, errorCode: null, data: { items: [] } }), 'SearchBookTitleError');
assert.equal(firstItem({ success: false, errorCode: 'SEARCH_001', data: null }), 'SearchBookTitleError');
assert.equal(firstItem({ success: false, errorCode: 'AUTH_002', data: null }), 'APIKeyInvalid');
assert.equal(firstItem({ success: false, errorCode: 'UPSTREAM_UNAVAILABLE', data: null }), 'SearchBookError');

assert.equal(normalizeDate('20140519'), '2014-05-19');
assert.equal(normalizeDate('2014-05-19T00:00:00'), '2014-05-19');
assert.equal(normalizeDate('2014년 5월'), '2014년 5월');

console.log('ok');
