interface Book {
  title: string;
  author: string;
  isbn: string;
  quantity: number;
  price: number;
}

interface ApiResponseJson {
  book: {
    title: string;
    author: string;
    isbn: string;
  };
  stock: {
    quantity: number;
    price: number;
  };
}
