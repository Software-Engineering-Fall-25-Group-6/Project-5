/*
 * FetchModel - Fetch a model from the web server.
 *   url - string - The URL to issue the GET request.
 * Returns: a Promise resolved with { data: <parsed JSON> } on success,
 * or rejected with { status, statusText } on error.
 * Must use XMLHttpRequest, not fetch or Axios.
 */

function FetchModel(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject({ status: 0, statusText: 'Invalid URL' });
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'text';

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const parsed = JSON.parse(xhr.responseText);
          resolve({ data: parsed });
        } catch (err) {
          reject({ status: xhr.status, statusText: 'Invalid JSON' });
        }
      } else {
        reject({ status: xhr.status, statusText: xhr.statusText });
      }
    };

    xhr.onerror = function () {
      reject({ status: xhr.status, statusText: xhr.statusText });
    };

    xhr.send();
  });
}

export default FetchModel;

