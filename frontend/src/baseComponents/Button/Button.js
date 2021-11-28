import React from 'react';
import c from './Button.module.css';

const Button = (props) => {
  const { children, className = '', onClick = (l) => l } = props;
  return (
    <div className={[c.button, className].join(' ')} onClick={onClick}>
      {children}
    </div>
  );
};

export default Button;
