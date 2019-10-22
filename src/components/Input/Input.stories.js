import React from 'react';
import Input from './index';
import { Password } from '../Icons';

export default ({ title: 'Input' });

export const simpleInput = () => (
  <Input type="password" required={false} placeholder="Введите пароль" errorText="Вы ошиблись, смиритесь и исправьтесь">
    <Password />
  </Input>
);
export const inputError = () => (
  <Input type="password" required={false} placeholder="Введите пароль" errorText="Вы ошиблись, смиритесь и исправьтесь" className="field--error">
    <Password />
  </Input>
);
