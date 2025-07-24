# Coding test

#### Code issues identified:

1. XMLHttpRequest is asynchronous:
   - The xhr.onload function is asynchronous, meaning that the result is populated only when the request completes, but the getBooksByAuthor function does not handle this properly. The function immediately returns result before the request is complete, which will always return an empty array because the request is asynchronous.
2. Error Handling:
   - The code handles the xhr.status check (if the status is 200), but if the status is not 200, it only alerts the user. This doesn't allow for proper error handling or retry logic. Using alert for error handling is generally not user-friendly in production environments. Instead, the error should be passed to a callback or promise rejection.
3. Incorrect module.exports:
   - The code exports GetBookListApiClient which is not defined. The correct export should be BookSearchApiClient.

#### Code fixes and improvement

1. Switched from XHR callbacks to fetch + async/await

2. Made getBooksByAuthor actually return data

- The method built a result array inside the XHR callback but didn’t return it.

- The method itself now returns a Promise<Book[]>, resolving to the parsed list or rejecting on error.

3. Error handling

- Non‑2xx HTTP statuses and JSON/XML parse failures now throw Error, so callers can try/catch.

4. URL construction with URL & URLSearchParams

- Leverage the URL API to build query strings safely.

5. Type safety via TypeScript interfaces

- Defined Book and ApiResponseJson interfaces, exported client class correctly.

6. Separated parsing logic into private methods

- Private parseJsonResponse and parseXmlResponse methods handle shape validation and mapping, using tag‑name lookups for XML.

7. Configurable base URL & format

- Constructor accepts apiUrl and format parameters.
- Validating apiUrl to catches malformed or unsupported endpoints up front.
- Stronger Type Safety for Format "json" | "xml".

8. Using switch instead of if-else

- More Clarity and Readability
