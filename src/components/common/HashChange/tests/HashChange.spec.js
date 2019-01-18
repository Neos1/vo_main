import React from 'react';
import { shallow } from 'enzyme';
import HashChange from '../HashChange';

describe('<HashChange />', () => {
    it('should render self', () => {
        shallow(
            <HashChange />,
        );
    });

    it('should handle hash change event', () => {
        const hashChangeSpy = jest.fn();
        const map = {};
        window.addEventListener = jest.fn((event, cb) => {
            map[event] = cb;
        });
        shallow(
            <HashChange onChange={hashChangeSpy} />,
        );
        window.location.hash = '#test';
        map.hashchange({ target: window });
        expect(hashChangeSpy).toBeCalled();
        expect(hashChangeSpy).toBeCalledWith({ hash: '#test' });
    });

    it('should handle hash change event with correct hash modifier', () => {
        const hashChangeSpy = jest.fn();
        const hashModifier = jest.fn(() => 'modifier test');
        const map = {};
        window.addEventListener = jest.fn((event, cb) => {
            map[event] = cb;
        });
        shallow(
            <HashChange
                onChange={hashChangeSpy}
                getLocationHash={hashModifier}
            />,
        );
        window.location.hash = '#test';
        map.hashchange({ target: window });
        expect(hashModifier).toBeCalled();
        expect(hashChangeSpy).toBeCalled();
        expect(hashChangeSpy).toBeCalledWith({ hash: 'modifier test' });
    });
});
