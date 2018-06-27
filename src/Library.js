import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import Bookshelf from './Bookshelf';

const Library = ({books}, {bookshelves}) =>
  <div className="list-books">
    <div className="list-books-title">
      <h1>MyReads</h1>
    </div>
    <div className="list-books-content">
      <div>
        {Object.entries(bookshelves).map(([shelf, title]) =>
          <Bookshelf
            key={shelf}
            books={books.filter(book => book.shelf === shelf)}
            title={title}
          />,
        )}
      </div>
    </div>
    <div className="open-search">
      <Link to="/search">Search a book</Link>
    </div>
  </div>;

Library.propTypes = {
  books: PropTypes.array.isRequired,
};
Library.contextTypes = {
  bookshelves: PropTypes.object,
};

export default Library;
