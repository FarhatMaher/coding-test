export default class BookSearchApiClient {
  private readonly format: "json" | "xml";
  private readonly apiUrl: string;

  constructor(apiUrl: string, format: "json" | "xml") {
    // Validate the API URL in the constructor
    this.validateApiUrl(apiUrl);

    // Initialise the properties
    this.apiUrl = apiUrl;
    this.format = format;
  }

  async getBooksByAuthor(authorName: string, limit: number): Promise<Book[]> {
    try {
      // Validate inputs
      this.validateInput(authorName, limit);

      const url = new URL("/by-author", this.apiUrl);
      url.searchParams.set("q", authorName);
      url.searchParams.set("limit", limit.toString());
      url.searchParams.set("format", this.format);

      const finalUrl = url.toString();
      console.log("Fetching books from URL:", finalUrl);
      const response = await fetch(finalUrl);
      console.log("Response status:", response.status);

      // Check for non-200 status codes
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }
      // Parse the response based on the specified format
      console.log("Parsing response...");

      let books: Book[] = [];

      switch (this.format) {
        case "json":
          // Parse JSON response
          console.log("Parsing JSON response...");
          const json: ApiResponseJson[] = await response.json();
          books = this.parseJsonResponse(json);
          return books;
        case "xml":
          // Parse XML response
          console.log("Parsing XML response...");
          const xml = await response.text();
          books = this.parseXmlResponse(xml);
          return books;
        default:
          // If format ever gains a new member, TS will error here
          throw new Error(`Unsupported format: ${this.format}`);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      throw new Error("Request failed");
    }
  }

  // Private methods for parsing responses

  // This method will parse the JSON response and map it to the Book interface
  private parseJsonResponse(json: ApiResponseJson[]): Book[] {
    return json.map((item) => ({
      title: item.book.title,
      author: item.book.author,
      isbn: item.book.isbn,
      quantity: item.stock.quantity,
      price: item.stock.price,
    }));
  }
  // This method will parse the XML response and map it to the Book interface
  private parseXmlResponse(xml: string): Book[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");

    const books: Book[] = [];
    const bookNodes = doc.getElementsByTagName("book");

    for (let i = 0; i < bookNodes.length; i++) {
      const bookNode = bookNodes[i];

      // Extract book details
      const title = bookNode.getElementsByTagName("title")[0].textContent || "";
      const author =
        bookNode.getElementsByTagName("author")[0].textContent || "";
      const isbn = bookNode.getElementsByTagName("isbn")[0].textContent || "";

      // Get the 'stock' element and extract quantity and price from it
      const stockNode =
        bookNode.parentElement?.getElementsByTagName("stock")[0];
      const quantity = stockNode
        ? parseInt(
            stockNode.getElementsByTagName("quantity")[0]?.textContent || "0",
          )
        : 0;
      const price = stockNode
        ? parseFloat(
            stockNode.getElementsByTagName("price")[0]?.textContent || "0",
          )
        : 0;

      // Push the book information to the books array
      books.push({ title, author, isbn, quantity, price });
    }

    return books;
  }
  private validateInput(authorName: string, limit: number): void {
    if (limit < 0) {
      throw new Error("Limit must be a non-negative integer");
    }
    if (typeof authorName !== "string" || authorName.trim() === "") {
      throw new Error("Author name must be a valid non-empty string");
    }
  }
  // This method will check if the API URL is valid
  private validateApiUrl(apiUrl: string): void {
    if (typeof apiUrl !== "string" || apiUrl.trim() === "") {
      throw new Error("API URL must be a valid non-empty string");
    }

    try {
      // Try to create a new URL object to check if it's a valid URL
      new URL(apiUrl);
    } catch (error) {
      console.error("Invalid API URL:", error);
      throw new Error("API URL must be a valid URL");
    }
  }
}
