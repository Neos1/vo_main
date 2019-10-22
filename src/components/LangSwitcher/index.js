import React from 'react';
import styles from './LangSwitcher.scss';


const LangSwitcher = () => (
  <div className={`${styles.lang}`}>
    <span className="lang--selected" data-value="RUS"> RUS </span>
    <div className="lang__options">
      <span className="lang__option" data-value="RUS"> Русский (RUS)</span>
      <span className="lang__option" data-value="ENG"> Русский (ENG)</span>
      <span className="lang__option" data-value="ESP"> Русский (ESP)</span>
    </div>
  </div>
);

export default LangSwitcher;
