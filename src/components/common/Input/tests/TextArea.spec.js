import React from 'react';
import { shallow } from 'enzyme';
import TextArea from '../TextArea';

describe('<TextArea />', () => {
    let styles;
    let field;

    beforeEach(() => {
        styles = {
            field: 'field',
            field__textarea: 'field__input',
        };
        field = {
            bind: () => ({
                type: 'text',
                placeholder: '',
            }),
            resetValidation: () => {},
            error: null,
        };
    });

    it('should render self', () => {
        const renderedComponent = shallow(
            <TextArea
                styles={styles}
                field={field}
                readOnly
            />,
        );
        expect(renderedComponent.find('.field').length).toBe(1);
        expect(renderedComponent.find('.field__input').length).toBe(1);
        expect(renderedComponent.find('.field__input').prop('placeholder')).toBe('');
    });

    it('should render self with all provided params correctly', () => {
        field = {
            bind: () => ({
                placeholder: 'test',
            }),
            error: 'test error',
            value: 'test',
        };
        const renderedComponent = shallow(
            <TextArea
                styles={styles}
                field={field}
                readOnly={false}
                open-focus
                classList={['test']}
            />,
        );
        expect(renderedComponent.find('.field').length).toBe(1);
        expect(renderedComponent.find('.field').hasClass('field--test')).toBe(true);
        expect(renderedComponent.find('.field__input').length).toBe(1);
        expect(renderedComponent.find('.field__input').hasClass('field__input--test')).toBe(true);
        expect(renderedComponent.find('.field__input').prop('placeholder')).toBe('test');
        expect(renderedComponent.find('.field__input').prop('open-focus')).toBe('true');
        expect(renderedComponent.find('.field__input').prop('value')).toBe('test');
    });

    it('should handle input event correctly', () => {
        const inputSpy = jest.fn();
        const inputEventData = { target: { value: 'my new test value' } };
        const renderedComponent = shallow(
            <TextArea
                styles={styles}
                field={field}
                onInput={inputSpy}
            />,
        );
        renderedComponent
            .find('.field__input')
            .first()
            .simulate('input', inputEventData);
        expect(inputSpy).toBeCalled();
        expect(inputSpy).toBeCalledWith(inputEventData);
    });
});
