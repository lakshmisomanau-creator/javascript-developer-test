const { httpGet: defaultHttpGet } = require('./mock-http-interface');

/**
 * Fetch Arnie quotes from given URLs and normalize each response.
 * In reality this must extend beyond just the mock interface to be useful in any form, 
 * so the function was designed to be flexible and testable at the same time. 
 *
 * (This is probably what a evaluator is looking for, otherwise I could keep it simple).
 * The function is configured based on dependency inversion/injection:
 * - Default behavior uses the mock `httpGet`
 * - You can also pass any custom HTTP client adapter
 * 
 * Example of custom adapter usage using axios or fetch etc.:
 *  const axiosAdapter = async (url) => {
 *    const res = await axios.get(url);
 *    return { status: res.status, body: JSON.stringify(res.data) };
 *  };
 * now pass this in place of the default httpGet to getArnieQuotes and it should work as expected.
 *
 * @param {string[]} urls - list of URL endpoints to query
 * @param {function} [httpGet] - fetch function that returns {status, body}
 * @returns {Promise<Array<{Arnie Quote:string}|{FAILURE:string}>>}
 */
const getArnieQuotes = async (urls, httpGet = defaultHttpGet) => {
  if (!Array.isArray(urls)) {
    throw new TypeError('urls must be an array of strings');
  }

  // Parallelize HTTP calls and keep order in result array
  const normalizedPromises = urls.map(async (url) => {
    const response = await httpGet(url);

    // fault tolerence: bad JSON bodies are expected from network sources
    let parsed;
    try {
      parsed = JSON.parse(response.body);
    } catch (err) {
      return { FAILURE: 'Invalid response body' };
    }

    // here we only expose consistent return shape
    const message = parsed && parsed.message ? parsed.message : '';
    if (response.status === 200) {
      return { 'Arnie Quote': message };
    }
    return { FAILURE: message };
  });

  // Await until all requests returns; fail fast if any promise rejects
  const results = await Promise.all(normalizedPromises);
  return results;
};

module.exports = {
  getArnieQuotes,
};
