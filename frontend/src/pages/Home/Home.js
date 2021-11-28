import React from 'react';
import QuizList from '../../components/QuizList/QuizList.js';
import c from './Home.module.css';
import SidebarLayout from '../../baseComponents/SidebarLayout/SidebarLayout.js';

const Home = () => {
  return (
    <SidebarLayout content={<QuizList />}>
      <div className={c.text}>Welcome! select a quiz on the left to start</div>
    </SidebarLayout>
  );
};

export default Home;
