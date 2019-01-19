import React from 'react';
import Container from '../../common/Container';

import styles from './Container.scss';

export default ({ children }) => (
    <Container styles={styles}>
        {children}
    </Container>
);
