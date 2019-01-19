import React from 'react';

const Container = (props) => {
    const { styles, children } = props;
    return (
        <div className={styles.container}>
            {children}
        </div>
    );
};

export default Container;
