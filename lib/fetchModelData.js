/*
 * FetchModel - Fetch a model from the web server.
 *   url: string (GET endpoint)
 * Resolves: { data: <parsed JSON> }
 * Rejects:  { status, statusText }
 * Must use XMLHttpRequest.
 */
export default function fetchModel(url) {
  return new Promise((resolve, reject) => {
    if (!url || typeof url !== 'string') {
      reject({ status: 0, statusText: 'Invalid URL' });
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'text';

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve({ data: JSON.parse(xhr.responseText) });
        } catch (e) {
          reject({ status: xhr.status, statusText: `Invalid JSON: ${e.message}` });
        }
      } else {
        reject({ status: xhr.status, statusText: xhr.statusText || 'HTTP error' });
      }
    };

    xhr.onerror = function () {
      reject({ status: xhr.status || 0, statusText: xhr.statusText || 'Network error' });
    };

    xhr.ontimeout = function () {
      reject({ status: 0, statusText: 'Request timed out' });
    };

    try {
      xhr.send();
    } catch (err) {
      reject({ status: 0, statusText: err.message || 'XHR send error' });
    }
  });
}
