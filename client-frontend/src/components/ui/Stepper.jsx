const Stepper = ({ currentStep, steps }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
            {stepIdx < currentStep ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-sky-600" />
                </div>
                <div className="relative w-8 h-8 flex items-center justify-center bg-sky-600 rounded-full">
                  <span className="text-white">{step.id}</span>
                </div>
              </>
            ) : stepIdx === currentStep ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="relative w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 border-2 border-sky-600 rounded-full">
                  <span className="text-sky-600">{step.id}</span>
                </div>
                <span className="absolute top-10 text-xs text-sky-500 font-semibold">{step.name}</span>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="relative w-8 h-8 flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded-full">
                  <span className="text-slate-500 dark:text-slate-400">{step.id}</span>
                </div>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Stepper;
