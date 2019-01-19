import React from 'react';
import { shallow } from 'enzyme';
import { Label } from '../Units';

describe('<Label />', () => {
    it('should render self', () => {
        const renderedComponent = shallow(
            <Label
                showLabel
                htmlFor="test"
                label="test"
            />,
        );
        expect(renderedComponent.find('label').length).toBe(1);
        expect(renderedComponent.find('label').text()).toBe('test');
        expect(renderedComponent.find('label').prop('htmlFor')).toBe('test');
    });

    it('should render nothing with showLabel = false', () => {
        const renderedComponent = shallow(
            <Label
                showLabel={false}
                htmlFor="test"
                label="test"
            />,
        );
        expect(renderedComponent.find('label').length).toBe(0);
    });
});
