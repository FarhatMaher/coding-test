import BookSearchApiClient from "./BookSearchApiClient";

// Example usage
async function main() {
  const apiUrl = "http://api.book-seller-example.com";
  const client = new BookSearchApiClient(apiUrl, "json");
  try {
    const booksByShakespeare = await client.getBooksByAuthor("Shakespeare", 10);
    console.log(booksByShakespeare);
  } catch (error) {
    console.error("Error fetching books:", error);
  }
}

main();
