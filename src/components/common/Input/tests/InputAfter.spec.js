import React from 'react';
import { shallow } from 'enzyme';
import { InputAfter } from '../Units';

describe('<InputAfter />', () => {
    let styles;

    beforeEach(() => {
        styles = {
            field: 'field',
            field__after: 'field__after',
        };
    });

    it('should render self', () => {
        const renderedComponent = shallow(
            <InputAfter
                styles={styles}
                content="test"
            />,
        );
        expect(renderedComponent.find('.field__after').length).toBe(1);
        expect(renderedComponent.find('.field__after').text()).toBe('test');
    });

    it('should render self with all provided params correctly', () => {
        const renderedComponent = shallow(
            <InputAfter
                styles={styles}
                content="test 2"
                classList={['test']}
            />,
        );
        expect(renderedComponent.find('.field__after').length).toBe(1);
        expect(renderedComponent.find('.field__after').hasClass('field__after--test')).toBe(true);
        expect(renderedComponent.find('.field__after').text()).toBe('test 2');
    });

    it('should render nothing with no content provided', () => {
        const renderedComponent = shallow(
            <InputAfter
                styles={styles}
                classList={['test']}
            />,
        );
        expect(renderedComponent.find('.field__after').length).toBe(0);
    });
});
