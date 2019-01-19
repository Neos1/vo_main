import React from 'react';
import { NavLink } from '../../common/Navigation/Navigation';
import { observer, inject } from 'mobx-react';
import { action } from 'mobx';

import styles from './Header.scss';

@inject('accountStore') @observer
class Header extends React.Component {
    render() {
        const props = this.props;
        const accountStore = props.accountStore;
        return (
            <header className={styles.header}>
                <div className={styles.header__logo}></div>
                <div className={styles.header__nav}>
                    <nav className={styles['header-nav']}>
                        <NavLink 
                            activeClassName={styles['header-nav__item--active']}
                            to={"/cabinet/voting"}
                            className={styles['header-nav__item'] + ' ' + styles['header-nav__item--home']} >
                            Голосование
                        </NavLink>
                        <NavLink 
                            activeClassName={styles['header-nav__item--active']}
                            to={"/cabinet/questions"}
                            className={styles['header-nav__item'] + ' ' + styles['header-nav__item--list']} >
                            Вопросы
                        </NavLink>
                        <NavLink 
                            activeClassName={styles['header-nav__item--active']}
                            to={"/settings"}
                            className={styles['header-nav__item'] + ' ' + styles['header-nav__item--settings']} >
                            Настройка
                        </NavLink>
                    </nav>
                </div>
                <div className={styles['header__account'] + ' ' + styles['header-account']}>
                    <div className={styles['header-account__data']}>
                        <span className={styles['header-account__name']}>Кошелек: </span>
                        <span className={styles['header-account__content']}>{accountStore.current}</span>
                    </div>
                    <div className={styles['header-account__data']}>
                        <span className={styles['header-account__name']}>{accountStore.type} токены: </span>
                        <span className={styles['header-account__content']}>{accountStore.tokens}</span>
                    </div>
                    <div className={styles['header-account__avatar']}>
                        <img src={accountStore.avatar} />
                    </div>
                    <button onClick={this.logout} type="button" className="header__logout"></button>
                </div>
            </header>
        )
    }

    @action
    logout = () => {
        const props = this.props;
        const accountStore = props.accountStore;
        accountStore.unsetAccount();
    }
}

export default Header;