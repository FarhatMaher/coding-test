// Unit tests for BookSearchApiClient
import { BookSearchApiClient } from "./BookSearchApiClient";
import { JSDOM } from "jsdom";

// Mocking the global fetch function
global.fetch = jest.fn();
const apiUrl = "http://api.book-seller-example.com";

describe("BookSearchApiClient", () => {
  let client: BookSearchApiClient;

  beforeEach(() => {
    // Set up a fresh instance of the client before each test
    client = new BookSearchApiClient(apiUrl, "json");
  });

  afterEach(() => {
    // Clear any mocked calls after each test
    jest.clearAllMocks();
  });

  test("should create client successfully with valid URL", () => {
    // Test with a valid URL
    expect(() => new BookSearchApiClient(apiUrl, "json")).not.toThrow();
  });

  test("should throw an error for invalid URL", () => {
    // Test with an invalid URL
    expect(() => new BookSearchApiClient("invalid-url", "json")).toThrow(
      "API URL must be a valid URL",
    );
  });

  test("should throw an error for empty URL", () => {
    // Test with an empty URL
    expect(() => new BookSearchApiClient("", "json")).toThrow(
      "API URL must be a valid non-empty string",
    );
  });

  test("should fetch books and transform data correctly", async () => {
    // Mock the response from fetch
    const mockResponse = [
      {
        book: { title: "Hamlet", author: "Shakespeare", isbn: "12345" },
        stock: { quantity: 10, price: 19.99 },
      },
    ];

    // Mock fetch to return the mocked response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const books = await client.getBooksByAuthor("Shakespeare", 1);

    // Assert that the response is correct
    expect(books).toEqual([
      {
        title: "Hamlet",
        author: "Shakespeare",
        isbn: "12345",
        quantity: 10,
        price: 19.99,
      },
    ]);

    expect(fetch).toHaveBeenCalledWith(
      `${apiUrl}/by-author?q=Shakespeare&limit=1&format=json`,
    );
  });

  test("should handle fetch failure gracefully", async () => {
    // Mock fetch to simulate a failed request (status 500)
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: jest.fn(),
    });

    // Expect an error to be thrown when calling the API
    await expect(client.getBooksByAuthor("Shakespeare", 1)).rejects.toThrow(
      "Request failed",
    );
  });

  test("should throw error when API response is not JSON", async () => {
    // Mock fetch to simulate an invalid JSON response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockRejectedValueOnce(new Error("Invalid JSON")),
    });

    // Expect the promise to throw an error
    await expect(client.getBooksByAuthor("Shakespeare", 1)).rejects.toThrow(
      "Request failed",
    );
  });

  test("should return an empty array if no books are found", async () => {
    const mockResponse: ApiResponseJson[] = []; // Empty response

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const books = await client.getBooksByAuthor("Author Not Found", 1);

    expect(books).toEqual([]); // No books found
  });

  test("should handle invalid JSON structure gracefully", async () => {
    // Mocking malformed JSON response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ malformed: "data" }),
    });

    await expect(client.getBooksByAuthor("Shakespeare", 1)).rejects.toThrow(
      "Request failed",
    );
  });

  test("should handle XML data format response correctly", async () => {
    const mockXmlResponse = `
      <response>
        <book>
          <title>Macbeth</title>
          <author>Shakespeare</author>
          <isbn>67890</isbn>
        </book>
        <stock>
          <quantity>5</quantity>
          <price>15.99</price>
        </stock>
      </response>
    `;
    // Mocking the global DOMParser
    const dom = new JSDOM("");
    global.DOMParser = dom.window.DOMParser;
    // Mocking fetch to return the mocked XML response
    const clientWithXmlFormat = new BookSearchApiClient(apiUrl, "xml");
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue(mockXmlResponse), // Returning text for XML
    });
    // Mocking the parseXmlResponse method to return a specific structure
    const books = await clientWithXmlFormat.getBooksByAuthor("Shakespeare", 1);
    expect(books).toEqual([
      {
        title: "Macbeth",
        author: "Shakespeare",
        isbn: "67890",
        quantity: 5,
        price: 15.99,
      },
    ]);
  });

  test("should handle invalid parameters gracefully (negative limit)", async () => {
    const mockResponse = [
      {
        book: { title: "Hamlet", author: "Shakespeare", isbn: "12345" },
        stock: { quantity: 10, price: 19.99 },
      },
    ];

    // Mock fetch to return the mocked response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    // Test with invalid negative limit
    await expect(client.getBooksByAuthor("Shakespeare", -1)).rejects.toThrow(
      "Request failed",
    );
  });

  test("should handle empty author name gracefully", async () => {
    const mockResponsee: ApiResponseJson[] = [];

    // Mock fetch to return the mocked response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponsee),
    });

    // Test with invalid negative limit
    await expect(client.getBooksByAuthor("", 1)).rejects.toThrow(
      "Request failed",
    );
  });
});
