import React from 'react';
import { observer } from 'mobx-react';
import { InputBefore, InputAfter, Label } from './Units';

export default observer(({
    field,
    type = 'text',
    placeholder = null,
    showLabel = false,
    ...rest
}) => {
    const { styles } = rest;
    return (
        <div
            className={
                styles.field
                + (rest.classList ? rest.classList.map(className => ` ${styles.field}--${className}`).join('') : '')
            }
            data-error={field.error ? field.error : null}
        >
            <InputBefore
                styles={styles}
                classList={rest.classList}
                content={rest.before}
            />
            <Label
                showLabel={showLabel}
                htmlFor={field.id}
                label={field.label}
            />
            <input
                {...field.bind({ type, placeholder })}
                open-focus={rest['open-focus'] ? rest['open-focus'].toString() : null}
                readOnly={rest.readOnly}
                value={field.value || field.default}
                onInput={(ctx) => { field.resetValidation(); if (rest.onInput) rest.onInput(ctx); }}
                className={
                    styles.field__input
                    + (rest.classList ? rest.classList.map(className => ` ${styles.field__input}--${className}`).join('') : '')
                    + (field.error ? ` ${styles.field__input}--error` : '')
                }
            />
            <InputAfter
                styles={styles}
                classList={rest.classList}
                content={rest.after}
            />
        </div>
    );
});

const SimpleInput = observer(({
    id,
    label,
    type = 'text',
    placeholder = null,
    showLabel = false,
    ...rest
}) => {
    const { styles } = rest;
    return (
        <div
            className={
                styles.field
                + (rest.classList ? rest.classList.map(className => ` ${styles.field}--${className}`).join('') : '')
            }
            data-error={rest.error}
        >
            <InputBefore
                styles={styles}
                classList={rest.classList}
                content={rest.before}
            />
            <Label
                showLabel={showLabel}
                htmlFor={id}
                label={label}
            />
            <input
                id={id}
                onChange={rest.onChange}
                value={rest.value}
                readOnly={rest.readOnly}
                type={type}
                placeholder={placeholder}
                className={
                    styles.field__input
                    + (rest.classList ? rest.classList.map(className => ` ${styles.field__input}--${className}`).join('') : '')
                }
            />
            <InputAfter
                styles={styles}
                classList={rest.classList}
                content={rest.after}
            />
        </div>
    );
});

export {
    SimpleInput,
};
