import React from 'react';
import { shallow } from 'enzyme';
import { InputBefore } from '../Units';

describe('<InputBefore />', () => {
    let styles;

    beforeEach(() => {
        styles = {
            field: 'field',
            field__before: 'field__before',
        };
    });

    it('should render self', () => {
        const renderedComponent = shallow(
            <InputBefore
                styles={styles}
                content="test"
            />,
        );
        expect(renderedComponent.find('.field__before').length).toBe(1);
        expect(renderedComponent.find('.field__before').text()).toBe('test');
    });

    it('should render self with all provided params correctly', () => {
        const renderedComponent = shallow(
            <InputBefore
                styles={styles}
                content="test 2"
                classList={['test']}
            />,
        );
        expect(renderedComponent.find('.field__before').length).toBe(1);
        expect(renderedComponent.find('.field__before').hasClass('field__before--test')).toBe(true);
        expect(renderedComponent.find('.field__before').text()).toBe('test 2');
    });

    it('should render nothing with no content provided', () => {
        const renderedComponent = shallow(
            <InputBefore
                styles={styles}
                classList={['test']}
            />,
        );
        expect(renderedComponent.find('.field__before').length).toBe(0);
    });
});
