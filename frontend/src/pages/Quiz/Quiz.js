import React from 'react';
import { useParams } from 'react-router-dom';
import QuizList from '../../components/QuizList/QuizList.js';
import QuizWizard from '../../components/QuizWizard/QuizWizard.js';
import SidebarLayout from '../../baseComponents/SidebarLayout/SidebarLayout.js';
import { useQuery } from '../../providers/Data/index.js';
import QuizResult from '../../components/QuizResult/QuizResult.js';

const Quiz = () => {
  const { id } = useParams();
  const { data, loading } = useQuery('userAnswer_fetch', {
    where: { user: { _eq: 'me' }, question: { quiz: { id: { _eq: id } } } },
  });
  const userAnswers = data || [];
  if (loading) return <div />;
  return (
    <SidebarLayout key={id} content={<QuizList />}>
      {userAnswers.length > 0 ? <QuizResult id={id} /> : <QuizWizard id={id} />}
    </SidebarLayout>
  );
};

export default Quiz;
