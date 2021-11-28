import React from 'react';
import Radio from '../../baseComponents/Radio/Radio.js';
import c from './Question.module.css';

const Question = (props) => {
  const { question, answer, onAnswer } = props;
  return (
    <div className={c.question}>
      <div className={c.label}>{question.label}</div>
      <ul className={c.choiceList}>
        {question.questionChoices.map((questionChoice) => (
          <li
            key={questionChoice.id}
            className={c.questionChoice}
            onClick={() => onAnswer(questionChoice.id)}
          >
            <Radio className={c.radioButton} checked={answer === questionChoice.id} />{' '}
            {questionChoice.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Question;
