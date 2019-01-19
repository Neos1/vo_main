import React from 'react';
import { observer } from 'mobx-react';
import { InputAfter, Label } from './Units';

@observer
class TextArea extends React.Component {
    render() {
        const _self = this;
        const {
            field,
            type = 'text',
            placeholder = null,
            showLabel = false,
            ...rest
        } = _self.props;
        this._field = field;
        const { styles } = rest;
        return (
            <div
                className={
                    styles.field
                    + (rest.classList ? rest.classList.map(className => ` ${styles.field}--${className}`).join('') : '')
                }
                data-error={field.error ? field.error : ''}
            >
                <Label
                    showLabel={showLabel}
                    htmlFor={field.id}
                    label={field.label}
                />
                <textarea
                    {...field.bind({ type, placeholder })}
                    open-focus={rest['open-focus'] ? rest['open-focus'].toString() : null}
                    value={field.value || field.default}
                    onInput={(ctx) => {
                        field.resetValidation();
                        if (rest.onInput) rest.onInput(ctx);
                    }}
                    className={
                        styles.field__textarea
                        + (rest.classList ? rest.classList.map(className => ` ${styles.field__textarea}--${className}`).join('') : '')
                        + (field.error ? ` ${styles.field__textarea}--error` : '')
                    }
                    maxLength={rest.maxLength}
                />
                <InputAfter
                    styles={styles}
                    classList={rest.classList}
                    content={rest.after}
                />
            </div>
        );
    }
}

export default TextArea;
