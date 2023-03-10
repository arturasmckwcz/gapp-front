const headers = new Headers();
headers.append("content-type", "application/json");

export default class BooksState {
  async setLocalStorage(key, value, expiry) {
    const now = new Date();
    const item = {
      value: value,
      expiry: now.getTime() + expiry,
    };
    await localStorage.setItem(key, JSON.stringify(item));
  }

  async getBooks(key) {
    let booksObj;
    const itemStr = await localStorage.getItem(key);
    if (!itemStr) {
      const result = await fetch("http://localhost:3000/graphql", {
        method: "POST",
        headers,
        body: JSON.stringify({ query: "{books{title,author}}" }),
      })
        .then((response) => response.json())
        .catch(
          (error) =>
            (document.getElementById(
              "books"
            ).innerHTML = `${error.message}. Please ensure API is running and try again.`)
        );
      console.log(result);
      booksObj = result?.data?.books;
      this.setLocalStorage("books", booksObj, 10000);
      return booksObj;
    } else {
      booksObj = await JSON.parse(window.localStorage.getItem("books"));
      const expiry = booksObj.expiry;
      if (new Date(expiry) < new Date().getTime()) {
        window.localStorage.clear();
        const result = await fetch("http://78.56.77.77:3000/graphql", {
          method: "POST",
          headers,
          body: JSON.stringify({ query: "{books{title,author}}" }),
        }).then((response) => response.json());
        booksObj = result?.data?.books;
        this.setLocalStorage("books", booksObj, 10000);
        return booksObj;
      } else {
        return booksObj.value;
      }
    }
  }
}
