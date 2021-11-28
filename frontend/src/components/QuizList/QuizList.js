import React from 'react';
import { useQuery, useMutation } from '../../providers/Data/index.js';
import c from './QuizList.module.css';
import Button from '../../baseComponents/Button/Button.js';
import { useNavigate, useParams } from 'react-router-dom';

const QuizList = () => {
  const { id } = useParams();

  const { data } = useQuery('quiz_fetch');
  const [initQuizzes] = useMutation('quiz_init', {
    refetchQueries: ['quiz_fetch', 'userAnswer_fetch'],
  });
  const quizzes = data || [];
  const navigate = useNavigate();

  const init = () => {
    initQuizzes();
    navigate('/');
  };
  return (
    <div className={c.quizList}>
      <div className={c.title}>Quizzes</div>
      <div className={c.addQuiz}>
        <Button className={c.btn} onClick={init}>
          Init quiz
        </Button>
      </div>
      <ul className={c.list}>
        {quizzes.map((quiz) => (
          <li
            key={quiz.id}
            className={[c.quiz, id === quiz.id ? c.activeQuiz : ''].join(' ')}
            onClick={() => navigate(`/quiz/${quiz.id}`)}
          >
            {quiz.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizList;
