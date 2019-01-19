// Disclaimer: the original code has been taken from
// https://github.com/dashed/react-hashchange
// And then slightly modified

// 3rd-party imports

import { Component } from 'react';

// helpers

const getLocationHash = () => (
    window.location.hash
);

// component

export default class HashChange extends Component {
    static defaultProps = {
        onChange: () => {},
        getLocationHash,
    };

    componentDidMount() {
        window.addEventListener('hashchange', this.handleHashChange, false);
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.handleHashChange, false);
    }

    handleHashChange = () => {
        const { props } = this;
        const hash = props.getLocationHash();
        props.onChange({ hash });
    };

    render() {
        return null;
    }
}
