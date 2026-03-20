const { getArnieQuotes } = require('./get-arnie-quotes');

const urls = [
  'http://www.smokeballdev.com/arnie0',
  'http://www.smokeballdev.com/arnie1',
  'http://www.smokeballdev.com/arnie2',
  'http://www.smokeballdev.com/arnie3',
];

// Basic safety check: no exceptions for standard URLs
test('expect no throws', () => {
  expect.assertions(1);
  expect(async () => await getArnieQuotes(urls)).not.toThrow();
});

// Verifies success / failure behavior matches expected transformed shape
test('responses to be correct', async () => {
  expect.assertions(5);

  const results = await getArnieQuotes(urls);

  expect(results.length).toBe(4);

  expect(results[0]).toEqual({ 'Arnie Quote': 'Get to the chopper' });
  expect(results[1]).toEqual({ 'Arnie Quote': 'MY NAME IS NOT QUAID' });
  expect(results[2]).toEqual({ 'Arnie Quote': `What's wrong with Wolfie?` });
  expect(results[3]).toEqual({ 'FAILURE': 'Your request has been terminated' });
});

// Performance check: operations should complete under 400ms for the mocked latency
test('code to be executed in less than 400ms', async () => {
  expect.assertions(2);

  const startTime = process.hrtime();
  await getArnieQuotes(urls);
  const [seconds, nanos] = process.hrtime(startTime);

  expect(seconds).toBe(0);
  expect(nanos / 1000 / 1000).toBeLessThan(400);
});

// Input validation ensures contract is enforced
test('invalid input type should throw TypeError', async () => {
  expect.assertions(1);
  await expect(getArnieQuotes('not-an-array')).rejects.toThrow(TypeError);
});

// Failure response from API should be normalized to FAILURE object
test('handles HTTP failure responses with FAILURE key', async () => {
  expect.assertions(2);

  const failingUrls = ['http://www.smokeballdev.com/arnie3'];
  const results = await getArnieQuotes(failingUrls);

  expect(results.length).toBe(1);
  expect(results[0]).toEqual({ FAILURE: 'Your request has been terminated' });
});

// empty input returns empty output quickly
test('handles empty URL array as empty results', async () => {
  expect.assertions(1);

  const results = await getArnieQuotes([]);
  expect(results).toEqual([]);
});

// missing message in valid 200 response yields empty quote string
test('handles valid status with missing message as empty string', async () => {
  expect.assertions(1);

  const fakeHttpGet = jest.fn().mockResolvedValue({ status: 200, body: JSON.stringify({}) });
  const results = await getArnieQuotes(['http://ignored'], fakeHttpGet);

  expect(results).toEqual([{ 'Arnie Quote': '' }]);
});
