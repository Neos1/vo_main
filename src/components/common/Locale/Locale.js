import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import { sprintf } from 'sprintf-js';

// component
@inject(/*'translationStore'*/) @observer
class Locale extends Component {
    static propTypes = {
        children: PropTypes.string.isRequired,
        format: PropTypes.instanceOf(Array),
    };

    static defaultProps = {
        format: [],
    }

    render() {
        const {
            children,
            format,
            //translationStore,
        } = this.props;
        const key = children.trim();
        //const text = translationStore.languages[key] || key;
        let target;
        if (format.length) {
            target = sprintf(text, ...format);
        } else {
            target = text.replace(/%s/g, '');
        }
        return (
            <span dangerouslySetInnerHTML={{ __html: target }} />
        );
    }
}

export default Locale;
