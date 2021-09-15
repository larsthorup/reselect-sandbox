const assert = require('assert');
const R = require('ramda');
const { createSelector } = require('reselect');

const cacheResultOf = require('./cacheResultOf');

const selectContactIdList = createSelector(
  state => state.contact,
  contact => {
    return R.sortBy(R.prop('name'), R.values(contact)).map(R.prop('id'));
  }
);

const selectContactIdListCached = cacheResultOf(
  createSelector(
    state => state.contact,
    contact => {
      return R.sortBy(R.prop('name'), R.values(contact)).map(R.prop('id'));
    }
  )
);

const state1 = {
  contact: {
    '1': { id: '1', name: 'Lars Christensen' },
    '2': { id: '2', name: 'Kristian Dupont' },
    '3': { id: '3', name: 'Sonny Korte' }
  },
  country: {
    '8': { id: '8', name: 'Denmark' }
  }
};

// When calling selector
const contactIdList1 = selectContactIdList(state1);
const contactIdList1Cached = selectContactIdListCached(state1);

// It returns the correct array of ids
assert.deepEqual(contactIdList1, ['2', '1', '3']);
assert.deepEqual(contactIdList1Cached, ['2', '1', '3']);

// When calling selector on the same state
const contactIdList1Again = selectContactIdList(state1);
const contactIdList1CachedAgain = selectContactIdListCached(state1);

// Then select return the SAME value (because nothing changed)
assert.strictEqual(contactIdList1Again, contactIdList1);
assert.strictEqual(contactIdList1CachedAgain, contactIdList1Cached);

// When calling selector on new state updated only in a non-dependent slice
const state2 = R.assocPath(['country', '8', 'name'], 'Danmark', state1);
const contactIdList2 = selectContactIdList(state2);
const contactIdList2Cached = selectContactIdListCached(state2);

// Then select still returns SAME value (because no dependency was changed)
assert.strictEqual(contactIdList2, contactIdList1);
assert.strictEqual(contactIdList2Cached, contactIdList1Cached);

// When calling selector on new state updated in a dependent slice
const state3 = R.assocPath(['contact', '1', 'name'], 'Lars Thorup', state2);
const contactIdList3 = selectContactIdList(state3);
const contactIdList3Cached = selectContactIdListCached(state3);

// Then select still returns an EQUAL value
assert.deepEqual(contactIdList3, contactIdList1);
assert.deepEqual(contactIdList3Cached, contactIdList1Cached);

// But then no-caching select no longer returns the SAME value (because the array got recomputed)
assert.notStrictEqual(contactIdList3, contactIdList1);

// But the CACHING select still returns the SAME value (because of the equality check)
assert.strictEqual(contactIdList3Cached, contactIdList1Cached);

// Only when calling selector on new state updated to give a different result
const state4 = R.assocPath(['contact', '3', 'name'], 'Bent Jensen', state3);
const contactIdList4 = selectContactIdList(state4);
const contactIdList4Cached = selectContactIdListCached(state4);

// Then select returns a DIFFERENT value
assert.notStrictEqual(contactIdList4, contactIdList1);
assert.notStrictEqual(contactIdList4Cached, contactIdList1Cached);

const f = cacheResultOf((xs, ys) => xs.concat(ys).sort());
assert.strictEqual(f([1, 2, 3], [4, 5, 6]), f([1, 2], [3, 4, 5, 6]));

console.log('All tests passed.')