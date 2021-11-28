import React from 'react';
import c from './SidebarLayout.module.css';

const SidebarLayout = (props) => {
  const { children, content } = props;
  return (
    <div className={c.layout}>
      <div className={c.sidebar}>{content}</div>
      <div>{children}</div>
    </div>
  );
};

export default SidebarLayout;
