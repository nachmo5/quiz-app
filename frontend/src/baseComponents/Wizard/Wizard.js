import React from 'react';
import Button from '../Button/Button.js';
import c from './Wizard.module.css';

const Wizard = (props) => {
  const { children, steps = 0 } = props;
  const { nextDisabled = () => false, beforeNext = (l) => l, submit = (l) => l } = props;
  const [step, setStep] = React.useState(0);

  const next = () => {
    if (nextDisabled(step)) return;
    if (step !== steps - 1) {
      const result = beforeNext();
      if (result && result.then) {
        result.then(() => setStep((v) => v + 1));
      } else {
        setStep((v) => v + 1);
      }
    }
  };

  const previous = () => {
    if (step !== 0) setStep((v) => v - 1);
  };

  return (
    <div className={c.wizard}>
      <div className={c.header}>{`${step + 1}/${steps}`}</div>
      <div className={c.body}>{children({ step })}</div>
      <div className={c.footer}>
        {step !== 0 && (
          <Button onClick={previous} className={[c.btn, c.prev].join(' ')}>
            Previous
          </Button>
        )}
        {step !== steps - 1 && (
          <Button
            onClick={next}
            className={[c.btn, c.next, nextDisabled(step) ? c.disabled : ''].join(' ')}
          >
            Next
          </Button>
        )}
        {step === steps - 1 && (
          <Button
            onClick={submit}
            className={[c.btn, c.submit, nextDisabled(step) ? c.disabled : ''].join(' ')}
          >
            Submit
          </Button>
        )}
      </div>
    </div>
  );
};

export default Wizard;
