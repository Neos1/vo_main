import React from 'react';
import { Button, IconButton } from './index';
import { AddIcon, BackIcon } from '../Icons';


export default { title: 'Button' };

export const Black = () => <Button className="btn--default btn--black"> Отправить </Button>;
export const White = () => <Button className="btn--big btn--white"> NEOS </Button>;
export const Small = () => <Button className="btn--small btn--white"> NEOS </Button>;

export const WhiteDashed = () => (
  <IconButton className="btn--big btn--white btn--dashed">
    <AddIcon />
    Отправить
  </IconButton>
);

export const linkButton = () => <Button className="btn--link"> Создать новый ключ </Button>;
export const arrowButton = () => (
  <IconButton className="btn--link btn--noborder">
    <BackIcon />
    Назад
  </IconButton>
)