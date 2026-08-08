import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface OnboardingViewProps {
  onComplete: () => void;
  onLanguageChange: (lang: string) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  onComplete,
  onLanguageChange
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa';
  const [currentStep, setCurrentStep] = useState<number>(1);

  const ChevronNext = isRtl ? ArrowLeft : ArrowRight;
  const ChevronBack = isRtl ? ArrowRight : ArrowLeft;

  const handleSelectLanguage = (lang: string) => {
    onLanguageChange(lang);
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-base-100 text-base-content flex flex-col justify-between p-6 safe-top safe-bottom animate-in fade-in duration-300">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-lg text-base-content tracking-tight">
            {t('app.title')}
          </span>
        </div>

        <button
          type="button"
          onClick={onComplete}
          className="btn btn-sm btn-ghost text-base-content/60 hover:text-base-content font-medium text-xs rounded-xl"
        >
          {t('onboarding.skip')}
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center max-w-md w-full mx-auto my-auto py-8">
        {currentStep === 1 && (
          <div className="w-full space-y-8 text-center animate-in fade-in duration-300">
            <div className="w-32 h-32 rounded-3xl flex items-center justify-center mx-auto">
              <img src="/assets/step1.png" alt="Language" className="w-full h-full object-contain" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-base-content tracking-tight">
                {t('onboarding.step1Title')}
              </h1>
              <p className="text-sm text-base-content/60 max-w-xs mx-auto">
                {t('onboarding.step1Sub')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => handleSelectLanguage('fa')}
                className={`p-5 rounded-2xl border flex flex-col items-center justify-center gap-3 transition ${i18n.language === 'fa'
                  ? 'bg-primary/10 border-primary text-primary shadow-xs'
                  : 'bg-base-200/50 border-base-300 hover:border-base-300/80 text-base-content/80'
                  }`}
              >
                <span className="text-lg font-bold">فارسی</span>
                {i18n.language === 'fa' && <Check className="w-5 h-5 text-primary" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectLanguage('en')}
                className={`p-5 rounded-2xl border flex flex-col items-center justify-center gap-3 transition ${i18n.language === 'en'
                  ? 'bg-primary/10 border-primary text-primary shadow-xs'
                  : 'bg-base-200/50 border-base-300 hover:border-base-300/80 text-base-content/80'
                  }`}
              >
                <span className="text-lg font-bold">English</span>
                {i18n.language === 'en' && <Check className="w-5 h-5 text-primary" />}
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="w-full space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-32 h-32 rounded-3xl flex items-center justify-center mx-auto">
              <img src="/assets/step2.png" alt="Language" className="w-full h-full object-contain" />
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-base-content tracking-tight">
                {t('onboarding.step2Title')}
              </h1>
              <div className="bg-base-200/60 p-5 rounded-3xl border border-base-300 text-sm text-base-content/80 leading-relaxed text-center shadow-xs">
                {t('onboarding.step2Desc')}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="w-full space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-32 h-32 rounded-3xl flex items-center justify-center mx-auto">
              <img src="/assets/step3.png" alt="Language" className="w-full h-full object-contain" />
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-base-content tracking-tight">
                {t('onboarding.step3Title')}
              </h1>
              <div className="bg-base-200/60 p-5 rounded-3xl border border-base-300 text-sm text-base-content/80 leading-relaxed text-center shadow-xs">
                {t('onboarding.step3Desc')}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1 mb-4 max-w-md w-full mx-auto">
        <div>
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="btn btn-ghost gap-1.5 rounded-2xl text-xs font-bold"
            >
              <ChevronBack className="w-4 h-4" />
              {t('onboarding.back')}
            </button>
          ) : (
            <div className="w-20"></div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-2.5 rounded-full transition-all duration-300 ${step === currentStep ? 'w-8 bg-primary' : 'w-2.5 bg-base-300'
                }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="btn btn-primary gap-1.5 rounded-2xl text-xs font-bold text-primary-content px-6"
        >
          {currentStep === 3 ? t('onboarding.start') : t('onboarding.next')}
          {currentStep < 3 && <ChevronNext className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
