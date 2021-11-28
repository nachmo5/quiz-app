import React, { useState } from 'react';
import { useMutation, useQuery } from '../../providers/Data/index.js';
import Question from '../../components/Question/Question.js';
import Wizard from '../../baseComponents/Wizard/Wizard.js';
import c from './QuizWizard.module.css';

const QuizWizard = (props) => {
  const { id } = props;
  const { data, loading } = useQuery('quiz_fetch_one', { where: { id: { _eq: id } } });
  const [createAnswers] = useMutation('userAnswer_create_many', {
    refetchQueries: ['userAnswer_fetch'],
  });
  const [answers, setAnswers] = useState({});
  // Loading - Errors
  if (loading) return <div />;
  if (!data && !loading) {
    return <div className={c.text}>Quiz not found</div>;
  }
  // Methods
  const onAnswer = (questionId, choiceId) => setAnswers((p) => ({ ...p, [questionId]: choiceId }));

  const submit = () =>
    createAnswers({
      data: Object.keys(answers).reduce(
        (acc, questionId) => [
          ...acc,
          { question: { id: questionId }, questionChoice: { id: answers[questionId] }, user: 'me' },
        ],
        []
      ),
    });
  return (
    <div className={c.quiz}>
      <Wizard
        steps={data.questions.length}
        nextDisabled={(step) => !answers[data.questions[step].id]}
        submit={submit}
      >
        {({ step }) => {
          const question = data.questions[step];
          return (
            <Question
              question={question}
              onAnswer={(choiceId) => onAnswer(question.id, choiceId)}
              answer={answers[question.id]}
            />
          );
        }}
      </Wizard>
    </div>
  );
};

export default QuizWizard;
