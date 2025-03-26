let currentPage = 1;
let books;
let booksDisplayStyle = "LIST";
let booksOrder = document.querySelector("#sort").value;

//function to get books data acc to page
async function getBooksData(page) {
  try {
    const response = await fetch(
      `https://api.freeapi.app/api/v1/public/books?page=${page}&limit=10`
    );
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.log(error);
  }
}

//function to clear search field
function clearSearchField() {
  document.getElementById("searchField").value = "";
}

//function to sort books according to title or publised date,
function sortBooks(sortBy) {
  if (sortBy == "title") {
    books.data.sort((a, b) =>
      a.volumeInfo.title
        .toLowerCase()
        .localeCompare(b.volumeInfo.title.toLowerCase())
    );
  } else if (sortBy == "publishedDate") {
    books.data.sort((a, b) => {
      const dateA = a.volumeInfo.publishedDate
        ? new Date(a.volumeInfo.publishedDate)
        : Infinity;
      const dateB = b.volumeInfo.publishedDate
        ? new Date(b.volumeInfo.publishedDate)
        : Infinity;
      return dateA - dateB;
    });
  }
}

//function to display books data in list or grid
//style argument defines if books need to be displayed in list or grid format
//one piece is the book title or the books author which is found in the page , if its found then display only that otherwise normal showing of data
//The One Piece is real !

function displayBooks(style, onePiece = []) {
  if (onePiece.length == 0) {
    sortBooks(booksOrder);
  }
  const booksData = onePiece.length == 1 ? onePiece : books.data;
  let booksInfo =
    style == "LIST"
      ? `<div class="bookContents">`
      : `<div class="cards-container">`;
  const bookContents = document.querySelector(".contents");
  booksData.forEach((books) => {
    if (style == "LIST" && "volumeInfo" in books) {
      booksInfo += `<div class="tiles">
                            <img
                class="listThumbnails"
                src="${
                  books?.volumeInfo?.imageLinks?.thumbnail ||
                  books?.volumeInfo?.imageLinks?.smallThumbnail
                }"
                alt="Book image not available"
                onerror="this.onerror=null; if(this.src !== ${
                  books?.volumeInfo?.imageLinks?.smallThumbnail
                }) { this.src=${
        books?.volumeInfo?.imageLinks?.smallThumbnail
      }; } else { this.style.display='none'; }"
                />

              <div class="listBookDetails">
                <p class="listBookTitle">${books.volumeInfo.title}</p>
                <p class="listBookAuthor">${
                  Array.isArray(books?.volumeInfo?.authors)
                    ? books.volumeInfo.authors.join(", ")
                    : "Unknown Author"
                }</p>
                <p class="listBookPublisher">Published by: ${
                  books.volumeInfo.publisher || "Unknown Publisher"
                }</p>
                <p class="listBookPublishDate">Published on: ${
                  books.volumeInfo.publishedDate || "Unknown"
                }</p>
                <p class="listBookDescription">
                  ${books.volumeInfo.description || ""}
                </p>
                <a
                  class="bookLink"
                  href=${books.volumeInfo.infoLink}
                  target="_blank"
                >
                  View Book
                </a>
              </div>
            </div>`;
    } else if (style == "GRID") {
      booksInfo += `<div class="card">
          <img
         src="${
           books?.volumeInfo?.imageLinks?.thumbnail ||
           books?.volumeInfo?.imageLinks?.smallThumbnail
         }"
                alt="Book image not available"
                onerror="this.onerror=null; if(this.src !== '${
                  books?.volumeInfo?.imageLinks?.smallThumbnail
                }') { this.src='${
        books?.volumeInfo?.imageLinks?.smallThumbnail
      }'; } else { this.style.display='none'; }"   />
          <div class="card-details">
            <p class="card-title">${books.volumeInfo.title}</p>
            <p class="card-author">${
              Array.isArray(books?.volumeInfo?.authors)
                ? books.volumeInfo.authors.join(", ")
                : "Unknown Author"
            }</p>
            <p class="card-publisher">Published by: ${
              books.volumeInfo.publisher || "Unknown Publisher"
            }</p>
            <p class="card-date">Published on: ${
              books.volumeInfo.publishedDate || "Unknown"
            }</p>
            <p class="card-description">
            ${books.volumeInfo.description || ""}
            </p>
            <a
              class="bookLink"
              href=${books.volumeInfo.infoLink}
              target="_blank"
            >
              View Book
            </a>
          </div>
        </div>`;
    }
  });
  booksInfo += "</div>";
  bookContents.innerHTML = booksInfo;
}

//function to search books in the given page books data, 
//the search is done on book title and book author which is case insensetive
//we find the one piece over here and send to display it
function searchInBooksData(searchData) {
  if (!searchData) return;

  return books.data.find((book) => {
    const titleMatch =
      book.volumeInfo?.title?.toLowerCase() === searchData.toLowerCase();

    const authorsMatch = book.volumeInfo?.authors?.some(
      (author) => author.toLowerCase() === searchData.toLowerCase()
    );

    return titleMatch || authorsMatch;
  });
}

//handle page and at the same time get data for each page as well
document.querySelectorAll(".pageButton").forEach((button) =>
  button.addEventListener("click", async (pageButtonEvent) => {
    if (pageButtonEvent.target.id == "prevPage" && currentPage > 1) {
      books = await getBooksData(--currentPage);
      document.getElementById("pageNumber").textContent = `${currentPage}/21`;
    } else if (pageButtonEvent.target.id == "nextPage" && currentPage < 21) {
      books = await getBooksData(++currentPage);
      document.getElementById("pageNumber").textContent = `${currentPage}/21`;
    }

    clearSearchField();
    displayBooks(booksDisplayStyle);
  })
);

//sort event trigger is done here
document.querySelector("#sort").addEventListener("click", (event) => {
  booksOrder = event.target.value;
  sortBooks(booksOrder);
  displayBooks(booksDisplayStyle);
});

//book data display style trigger is done here
document.querySelector(".active").addEventListener("click", (activeEvent) => {
  if (activeEvent.target.textContent === "GRID") {
    activeEvent.target.textContent = "LIST";
    booksDisplayStyle = "LIST";
  } else {
    activeEvent.target.textContent = "GRID";
    booksDisplayStyle = "GRID";
  }
  clearSearchField();
  displayBooks(booksDisplayStyle);
});

//search event is triggered here
//this  is where we start looking for our one peice !
document
  .getElementById("searchField")
  .addEventListener("input", (searchEvent) => {
    const searchResult = searchInBooksData(searchEvent.target.value);
    if (searchResult) {
      displayBooks(booksDisplayStyle, [searchResult]);
    } else {
      displayBooks(booksDisplayStyle);
    }
  });

  //initial render
async function all() {
  books = await getBooksData(1);
  sortBooks(booksOrder);
  displayBooks("LIST");
}

all();
