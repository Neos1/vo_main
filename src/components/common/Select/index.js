import React, { Component } from 'react';
import styles from './style.scss';

class CustomSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      expanded: false,
      options: [
        {
          value: '0',
          label: 'Выберите'
        },
        {
          value: 'int',
          label: 'Число'
        },
        {
          value: 'string',
          label: 'Текст'
        },
        {
          value: 'address',
          label: 'Адрес'
        },
        {
          value: 'bytes4',
          label: 'Строка (4 байта)'
        },
      ]
    }
  }

  selectOption(index) {
    this.setState({
      value: index,
    })
    this.toggleOptions()
  }

  toggleOptions() {
    const { expanded } = this.state
    this.setState({ expanded: !expanded })
  }


  render() {
    const { options: values, value, expanded } = this.state

    let selectOptions = values.map((item, index) => {
      return <option key={index} value={item.value}>{item.label}</option>
    })

    let customSelectOptions = values.map((item, index) => {
      return <div className={styles['select__option']} key={index} onClick={this.selectOption.bind(this, index)}>{item.label}</div>
    })

    return (
      <div className={styles['select']}>
        <input value={values[value].value} className={styles['select__input']} />
        <div className={`${styles['select__wrapper']} ${expanded ? 'select__opened' : ""}`}>
          <div className={styles['select__heading']}
            onClick={this.toggleOptions.bind(this)}
          >
            <p>{values[value].label}</p>
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

export default CustomSelect;