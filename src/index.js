import React from 'react';
import { render } from 'react-dom';
import App from './App';
import './assets/styles/style.scss';

/**
 * Represents a book.
 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
 */

render(
  <App />,
  document.getElementById('root'),
);
