import React from 'react';
import PropTypes from 'prop-types';
import {Route} from 'react-router-dom';
import * as BooksAPI from './BooksAPI';
import './App.css';
import Library from './Library';
import SearchPage from './SearchPage';
import bookshelves from './bookshelves.json';

class BooksApp extends React.Component {
  static childContextTypes = {
    moveBook: PropTypes.func,
    bookshelves: PropTypes.object,
  };
  componentDidMount() {
    BooksAPI.getAll().then(books => {
      this.setState({books, booksLoaded: true});
    });
  }
  state = {
    books: [],
    lastRespondedCall: '',
    booksLoaded: false,
    query: '',
    searchBooks: [],
    searchQuery: '',
  };
  getChildContext() {
    return {moveBook: this.moveBook, bookshelves};
  }
  moveBook = (e, book) => {
    const shelf = e.target.value;
    // Move the book in API
    BooksAPI.update(book, shelf);
    // Move the book in the state
    this.setState(state => {
      // Change the shelf in Library
      const index = state.books.findIndex(({id}) => book.id === id);
      const books =
        index === -1
          ? // Book is not yet present in our Library (added from /search)
            [...state.books, {...book, shelf}]
          : // Book is already in library, change shelf
            [
              ...state.books.slice(0, index),
              {
                ...state.books[index],
                shelf,
              },
              ...state.books.slice(index + 1),
            ];
      // Change shelf in searched results
      const searchResults = state.searchBooks.findIndex(
        ({id}) => book.id === id,
      );
      const searchBooks =
        searchResults === -1
          ? // Book is not present in searched items, no changes
            state.searchBooks
          : // Book is in searched items, change shelf
            [
              ...state.searchBooks.slice(0, searchResults),
              {
                ...state.searchBooks[searchResults],
                shelf,
              },
              ...state.searchBooks.slice(searchResults + 1),
            ];

      return {
        books,
        searchBooks,
      };
    });
  };
  queryModify = e => {
    const query = e.target.value;
    const time = new Date();
    this.setState({query});
    BooksAPI.search(query, 20).then(books => {
      this.setState(state => {
        // record the result
        if (time > state.lastRespondedCall) {
            const searchBooks = (Array.isArray(books)
            ? books
            : []).map(searchedBook => {
            const bookInLibrary = state.books.find(
              ({id}) => id === searchedBook.id,
            );
            const shelf = bookInLibrary ? bookInLibrary.shelf : 'none';
            return {
              ...searchedBook,
              shelf,
            };
          });
          return {
            lastRespondedCall: time,
            searchBooks,
            searchQuery: query,
          };
        } else {
          return {};
        }
      });
    });
  };

  render() {
    const {
      books,
      booksLoaded,
      query,
      searchBooks,
      searchQuery,
    } = this.state;
    if (booksLoaded)
      return (
        <div className="app">
          <Route
            path="/search"
            render={() =>
              <SearchPage
                books={searchBooks}
                onQueryChange={this.queryModify}
                query={query}
                searchQuery={searchQuery}
              />}
          />
          <Route exact path="/" render={() => <Library books={books} />} />
        </div>
      );
    return <div className="loader">Loading...</div>;
  }
}

export default BooksApp;
