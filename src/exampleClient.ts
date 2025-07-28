import BookSearchApiClient from "./BookSearchApiClient";

// Example usage
// This script demonstrates how to use the BookSearchApiClient to fetch books by an author.
// Please run this script on the browser as it uses the Fetch API.
// Make sure to replace the API URL with a valid one for testing.
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
