// Test the chip/clear all logic from ProductList.jsx
function parsePriceInput(raw) {
  const trimmed = String(raw).trim();
  if (trimmed === '') return null;
  const value = Number(trimmed);
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : null;
}

function testFilterState(query, inStockOnly, minPrice, maxPrice) {
  const normalizedQuery = String(query || '').trim().toLowerCase();
  const parsedMin = parsePriceInput(minPrice !== undefined ? minPrice : '');
  const parsedMax = parsePriceInput(maxPrice !== undefined ? maxPrice : '');
  const priceRangeInvalid = parsedMin !== null && parsedMax !== null && parsedMin > parsedMax;
  
  const hasActiveFilters = normalizedQuery !== '' || inStockOnly || parsedMin !== null || parsedMax !== null;
  
  return {
    hasActiveFilters,
    priceRangeInvalid,
    normalizedQuery,
    inStockOnly,
    parsedMin,
    parsedMax
  };
}

// Test 1: No filters
let r = testFilterState('', false, '', '');
console.log('Test 1 - No filters: hasActiveFilters=' + r.hasActiveFilters + ' (expected: false)');

// Test 2: With query
r = testFilterState('mouse', false, '', '');
console.log('Test 2 - With query "mouse": hasActiveFilters=' + r.hasActiveFilters + ' (expected: true)');

// Test 3: In-stock only
r = testFilterState('', true, '', '');
console.log('Test 3 - In-stock only: hasActiveFilters=' + r.hasActiveFilters + ' (expected: true)');

// Test 4: With price filters
r = testFilterState('', false, '1000', '2000');
console.log('Test 4 - With price filters: hasActiveFilters=' + r.hasActiveFilters + ' (expected: true)');

// Test 5: Clear all should reset everything
function clearAll() {
  return testFilterState('', false, '', '');
}
r = clearAll();
console.log('Test 5 - After Clear all: hasActiveFilters=' + r.hasActiveFilters + ' (expected: false)');

// Test 6: Clear query only (keep price filters)
function clearQuery() {
  return testFilterState('', false, '1000', '2000');
}
r = clearQuery();
console.log('Test 6 - After clear query: hasActiveFilters=' + r.hasActiveFilters + ' parsedMin=' + r.parsedMin + ' parsedMax=' + r.parsedMax + ' (expected: true, with price filters)');

// Test 7: Invalid price range
r = testFilterState('', false, '2000', '1000');
console.log('Test 7 - Invalid range: priceRangeInvalid=' + r.priceRangeInvalid + ' (expected: true)');

// Test 8: All filters active
r = testFilterState('mouse', true, '1000', '2000');
console.log('Test 8 - All filters: hasActiveFilters=' + r.hasActiveFilters + ' (expected: true)');