import React from 'react';

const InputBefore = ({ styles, content, classList }) => (
    content ? (
        <div
            className={
                styles.field__before
                + (classList ? classList.map(className => ` ${styles.field__before}--${className}`).join('') : '')
            }
        >
            {content}
        </div>
    ) : null
);

const InputAfter = ({ styles, content, classList }) => (
    content ? (
        <div
            className={
                styles.field__after
                + (classList ? classList.map(className => ` ${styles.field__after}--${className}`).join('') : '')
            }
        >
            {content}
        </div>
    ) : null
);

const Label = ({ showLabel, htmlFor, label }) => (
    !showLabel
        ? null
        : (
            <label htmlFor={htmlFor}>
                {label}
            </label>
        )
);

export {
    InputBefore,
    InputAfter,
    Label,
};
