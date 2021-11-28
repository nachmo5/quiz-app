import React from 'react';
import { useQuery } from '../../providers/Data/index.js';
import c from './QuizResult.module.css';

const QuizResult = (props) => {
  const { id } = props;
  const { data, loading } = useQuery('userAnswer_count', {
    field: id,
    where: {
      questionChoice: { isRight: { _eq: true } },
      question: { quiz: { id: { _eq: id } } },
      user: { _eq: 'me' },
    },
  });
  const { data: quiz, loading: quizLoading } = useQuery('quiz_fetch_one', {
    where: { id: { _eq: id } },
  });
  if (loading || quizLoading) return <div />;
  const count = data || 0;
  return (
    <div className={c.quizResult}>
      <div>You have finished this quiz</div>
      <div>
        Your score is {count}/{quiz.questions.length}
      </div>
    </div>
  );
};

export default QuizResult;
