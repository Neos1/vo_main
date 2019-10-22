import React from 'react';
import {
  Button,
} from './components/Button';
import Input from './components/Input';
import {
  Password,
} from './components/Icons';
import LangSwitcher from './components/LangSwitcher';


const App = () => (
  <div>
    <h1>Прувет</h1>
    <Button className="btn--big btn--white">приувет</Button>

    <Input type="password" required={false} className="" placeholder="Введите пароль" errorText="Вы ошиблись, смиритесь и исправьтесь">
      <Password />
    </Input>
    <LangSwitcher />
  </div>
);
export default App;
