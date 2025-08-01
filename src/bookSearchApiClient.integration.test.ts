// Integration tests for BookSearchApiClient
import BookSearchApiClient from "./BookSearchApiClient";
import nock from "nock";

describe("BookSearchApiClient - Integration Tests", () => {
  const mockApiBaseUrl = "http://api.book-seller-example.com";
  const client = new BookSearchApiClient(mockApiBaseUrl, "json");

  afterEach(() => {
    nock.cleanAll(); // Clean up after each test
  });

  it("should successfully fetch books from the mock API", async () => {
    // Arrange: Mock the API request and response
    const mockResponse = [
      {
        book: { title: "Hamlet", author: "Shakespeare", isbn: "12345" },
        stock: { quantity: 10, price: 19.99 },
      },
    ];

    // Setting up the mock API endpoint with nock
    nock(mockApiBaseUrl)
      .get("/by-author")
      .query({ q: "Shakespeare", limit: "1", format: "json" })
      .reply(200, mockResponse);

    // Act: Call the method to get books
    const books = await client.getBooksByAuthor("Shakespeare", 1);
    console.log("Fetched books:", books);
    // Assert: Verify the results
    expect(books.length).toBe(1);
    expect(books[0].title).toBe("Hamlet");
    expect(books[0].author).toBe("Shakespeare");

    // Ensure that the correct API request was made
    expect(nock.isDone()).toBe(true); // Verifies that all expected nock requests were made
  });

  it("should handle API errors gracefully", async () => {
    // Arrange: Mock a 404 error from the API
    nock(mockApiBaseUrl)
      .get("/by-author")
      .query({ q: "Shakespeare", limit: "1", format: "json" })
      .reply(404, { message: "Not Found" });

    // Act & Assert: Expect an error to be thrown
    await expect(client.getBooksByAuthor("Shakespeare", 1)).rejects.toThrow(
      "Failed to fetch books.",
    );
  });
});
