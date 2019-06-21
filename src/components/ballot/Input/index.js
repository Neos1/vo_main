import React from 'react';
import { observer } from 'mobx-react';
import styles from './input.scss';

export default observer(({ field, type = 'text', placeholder = null, showLabel = false, ...rest }) => {
    return (
        <div 
            className={
                styles.field + 
                (rest.classList ? rest.classList.map(className => ' ' + styles.field + '--' + className) : '')
            }
            data-error={field.error ? field.error : ""} >
            <InputBefore 
                classList = {rest.classList}
                content = {rest.before} />
            <Label 
                showLabel={showLabel}
                htmlFor={field.id}
                label={rest.label} />
            <input 
                {...field.bind({ type, placeholder }) } 
                value={field.value || field.default}
                onInput={(ctx) => { field.resetValidation(); if (rest.onInput) rest.onInput(ctx)}}
                className={
                    styles.field__input + 
                    (rest.classList ? rest.classList.map(className => ' ' + styles.field__input + '--' + className) : '') +
                    (field.error ? ' ' + styles.field__input + '--error' : '')
                } />
            <InputAfter
                classList = {rest.classList}
                content = {rest.after} />
        </div>
    );
});

const SimpleInput = observer(({ id, label,index, maxLength, name, type = 'text', placeholder = null, showLabel = false, onChange, onFocus, onBlur, required = false, ...rest }) => {
    return (
        <div 
            className={
                styles.field + 
                (rest.classList ? rest.classList.map(className => ' ' + styles.field + '--' + className) : '')
            } >
            <InputBefore 
                classList = {rest.classList}
                content = {rest.before} />
            <Label 
                showLabel={showLabel}
                htmlFor={id}
                label={label} />
            <input 
                placeholder={placeholder}
                data-index={index}
                id={id}
                value={rest.value}
                readOnly={rest.readOnly}
                onChange={onChange}
                type={type}
                required={required}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder={placeholder}
                name={name}
                maxLength={maxLength}
                className={
                    styles.field__input + 
                    (rest.classList ? rest.classList.map(className => ' ' + styles.field__input + '--' + className) : '')
                } />
            <InputAfter
                classList = {rest.classList}
                content = {rest.after} />
        </div>
    )
})

const InputBefore = props => (
    props.content ? (
        <div className={
            styles.field__before + 
            (props.classList ? props.classList.map(className => ' ' + styles.field__before + '--' + className) : '')
        }>
            {props.content}
        </div>
    ) : null
)

const InputAfter = props => (
    props.content ? (
        <div className={
            styles.field__after + 
            (props.classList ? props.classList.map(className => ' ' + styles.field__after + '--' + className) : '')
        }>
            {props.content}
        </div>
    ) : null
)

const Label = props => (
    !props.showLabel ? null : ( 
        <label htmlFor={props.htmlFor}>
            { props.label }
        </label>
    )
);

export {
    SimpleInput
}