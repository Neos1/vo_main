import React from 'react';
import { shallow } from 'enzyme';
import { SimpleInput } from '../Input';

describe('<SimpleInput />', () => {
    let styles;
    let field;

    beforeEach(() => {
        styles = {
            field: 'field',
            field__input: 'field__input',
        };
    });

    it('should render self', () => {
        const renderedComponent = shallow(
            <SimpleInput
                styles={styles}
                readOnly
            />,
        );
        expect(renderedComponent.find('.field').length).toBe(1);
        expect(renderedComponent.find('.field__input').length).toBe(1);
        expect(renderedComponent.find('.field__input').prop('type')).toBe('text');
        expect(renderedComponent.find('.field__input').prop('placeholder')).toBe(null);
        expect(renderedComponent.find('.field__input').prop('readOnly')).toBe(true);
    });

    it('should render self with all provided params correctly', () => {
        const renderedComponent = shallow(
            <SimpleInput
                styles={styles}
                readOnly={false}
                classList={['test']}
                type="password"
                placeholder="test"
                value="test"
            />,
        );
        expect(renderedComponent.find('.field').length).toBe(1);
        expect(renderedComponent.find('.field').hasClass('field--test')).toBe(true);
        expect(renderedComponent.find('.field__input').length).toBe(1);
        expect(renderedComponent.find('.field__input').hasClass('field__input--test')).toBe(true);
        expect(renderedComponent.find('.field__input').prop('type')).toBe('password');
        expect(renderedComponent.find('.field__input').prop('placeholder')).toBe('test');
        expect(renderedComponent.find('.field__input').prop('readOnly')).toBe(false);
        expect(renderedComponent.find('.field__input').prop('value')).toBe('test');
    });

    it('should handle change event correctly', () => {
        const changeSpy = jest.fn();
        const changeEventData = { target: { value: 'my new test value' } };
        const renderedComponent = shallow(
            <SimpleInput
                styles={styles}
                field={field}
                onChange={changeSpy}
            />,
        );
        renderedComponent
            .find('.field__input')
            .first()
            .simulate('change', changeEventData);
        expect(changeSpy).toBeCalled();
        expect(changeSpy).toBeCalledWith(changeEventData);
    });
});
