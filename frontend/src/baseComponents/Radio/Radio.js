import React from 'react';
import c from './Radio.module.css';

const Radio = ({ className = '', checked = false }) => {
  return (
    <div className={[c.radio, className].join(' ')}>{checked && <div className={c.content} />}</div>
  );
};

export default Radio;
