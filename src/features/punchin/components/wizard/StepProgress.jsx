import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FaCheck } from 'react-icons/fa';

// Step Progress Component
const StepProgress = memo(({ currentStep, totalSteps, stepTitles }) => {

  const progressPercentage = useMemo(() => 
    ((currentStep - 1) / (totalSteps - 1)) * 100
  , [currentStep, totalSteps]);

 
  return (
    <div className="wizard_progress" role="progressbar" aria-valuenow={currentStep} aria-valuemax={totalSteps}>
      <div className="step_indicators">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <div 
              key={stepNumber} 
              className={`step_indicator  ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              aria-current={isActive ? 'step' : undefined}
            >
              <div className={`step_circle`}>
                {isCompleted ? <FaCheck aria-label="Completed" /> : stepNumber}
              </div>
              <div className="step_label">{stepTitles[stepNumber]}</div>
            </div>
          );
        })}
      </div>
      <div className="progress_bar">
        <div 
          className="progress_fill" 
          style={{ width: `${progressPercentage }%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
});

StepProgress.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  stepTitles: PropTypes.object.isRequired
};

StepProgress.displayName = 'StepProgress';

export default StepProgress;
