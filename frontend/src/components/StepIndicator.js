export default function StepIndicator({ steps, currentStep }) {
  return (
    <nav aria-label="Contract creation steps" className="mb-8">
      <ol className="flex items-center">
        {steps.map((step, i) => {
          const num = i + 1;
          const isCompleted = num < currentStep;
          const isCurrent = num === currentStep;
          const isLast = i === steps.length - 1;

          return (
            <li key={step} className={`flex items-center ${!isLast ? 'flex-1' : ''}`}>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                  isCompleted ? 'bg-teal-500 border-teal-500 text-white'
                  : isCurrent ? 'border-teal-500 text-teal-500 bg-white'
                  : 'border-gray-300 text-gray-400 bg-white'
                }`}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : num}
                </div>
                <span className={`ml-2 text-sm font-medium hidden sm:block ${isCurrent ? 'text-teal-600' : isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                  {step}
                </span>
              </div>
              {!isLast && (
                <div className={`flex-1 h-0.5 mx-3 ${isCompleted ? 'bg-teal-500' : 'bg-gray-200'}`} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
