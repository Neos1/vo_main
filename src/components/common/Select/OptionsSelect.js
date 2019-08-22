import React, { Component } from 'react';
import styles from './style.scss';

class OptionsSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    }
  }

  selectOption(index) {
    const { onClick } = this.props;
    onClick(index);
    this.toggleOptions()
  }

  toggleOptions() {
    const { expanded } = this.state
    this.setState({ expanded: !expanded })
  }


  render() {
    const { expanded } = this.state;
    const { value, options, isPagination } = this.props;

    let customSelectOptions = options.map((item, index) => {
      return (
        <div
          className={`${styles['select__option']} ${index == 0 ? 'hidden' : ''}`}
          key={index}
          onClick={this.selectOption.bind(this, index)}
        >
          {isPagination ? '' : <strong className={'note'}> {index} </strong>}
          {item.label}
        </div>)
    })

    return (
      <div className={styles['select']}>
        <input value={options[value].value} className={styles['select__input']} />
        <div className={`${styles['select__wrapper']} ${expanded ? 'select__opened' : ""}`}>
          <div className={styles['select__heading']}
            onClick={this.toggleOptions.bind(this)}
          >
            <p>
              {(value != 0 && !isPagination) ? <strong className='note'>{options[value].value + 1}</strong> : ''}
              {options[value].label}
            </p>
          </div>
          <div className={`${styles['select__options']} ${expanded ? '' : 'hidden'}`}>
            {
              customSelectOptions
            }
          </div>
        </div>

      </div>

    )
  }
}

export default OptionsSelect;