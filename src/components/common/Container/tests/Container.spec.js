import React from 'react';
import { shallow } from 'enzyme';
import Container from '..';

describe('<Container />', () => {
    it('should render self', () => {
        const renderedComponent = shallow(
            <Container
                styles={{ container: 'container' }}
            >
                test
            </Container>,
        );
        expect(renderedComponent.find('.container').length).toBe(1);
        expect(renderedComponent.find('.container').text()).toBe('test');
    });
});
