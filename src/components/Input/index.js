import React from 'react';
import propTypes from 'prop-types';
import styles from './Input.scss';

const Input = ({
  children, type, required = false, placeholder, className = '', errorText,
}) => (
  <div className={`${styles.field} ${className}`}>
    {children}
    <input className="field__input" type={type} placeholder={placeholder} required={required} />
    <span className="field__label">{placeholder}</span>
    <p className="field__error-text">
      {errorText}
    </p>
    <div className="field__line" />
  </div>
);
Input.propTypes = {
  children: propTypes.element.isRequired,
  type: propTypes.string.isRequired,
  placeholder: propTypes.string.isRequired,
  className: propTypes.string.isRequired,
  errorText: propTypes.string.isRequired,
  required: propTypes.bool.isRequired,
};

export default Input;
