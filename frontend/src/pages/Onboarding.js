import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useUser } from '../hooks/useUser';
import Button from '../components/Button';
import { toast } from 'react-toastify';

const slides = [
  {
    title: 'Welcome to AqadChain',
    body: 'AqadChain helps Muslim buyers and sellers in the US create Halal vehicle financing contracts that are both Shariah-compliant and legally binding under California law.',
    icon: '🕌',
  },
  {
    title: 'Two Shariah-Compliant Structures',
    body: 'Choose Murabaha (cost-plus financing with disclosed cost) or Musawama (negotiated price, no cost disclosure). Both are valid Islamic finance structures. Both are fully supported.',
    icon: '📋',
  },
  {
    title: 'E-Signatures Built In',
    body: 'Once you create a contract, both parties receive a DocuSign email to sign electronically. No printing, no scanning, no in-person meeting needed. The signed PDF is securely stored.',
    icon: '✍️',
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useUser();
  const navigate = useNavigate();

  const isLastSlide = step === slides.length;

  const handleNext = () => setStep((s) => s + 1);

  const handleComplete = async () => {
    if (!termsAccepted) {
      toast.error('Please accept the terms to continue.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.completeOnboarding();
      await refreshUser();
      navigate('/dashboard');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex justify-center space-x-2 mb-8">
          {[...slides, {}].map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-6 bg-teal-500' : i < step ? 'w-2 bg-teal-300' : 'w-2 bg-gray-300'}`} />
          ))}
        </div>

        <div className="bg-white rounded-card shadow-sm border border-gray-200 p-8">
          {!isLastSlide ? (
            <div className="text-center">
              <div className="text-5xl mb-6">{slides[step].icon}</div>
              <h2 className="text-2xl font-bold font-heading text-gray-900 mb-4">{slides[step].title}</h2>
              <p className="text-gray-600 leading-relaxed mb-8">{slides[step].body}</p>
              <Button onClick={handleNext} size="lg" className="w-full">
                {step < slides.length - 1 ? 'Next →' : 'Continue'}
              </Button>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold font-heading text-gray-900 mb-2 text-center">Terms & Conditions</h2>
              <p className="text-gray-500 text-sm text-center mb-6">Please review and accept before getting started</p>

              <div className="bg-gray-50 border border-gray-200 rounded p-4 text-xs text-gray-600 leading-relaxed h-40 overflow-y-auto mb-6">
                <p className="font-semibold mb-2">AqadChain Terms of Service (Summary)</p>
                <p className="mb-2">AqadChain provides software tools for generating vehicle financing contract templates. By using this platform, you acknowledge that:</p>
                <ul className="list-disc list-inside space-y-1 mb-2">
                  <li>AqadChain is not a lender, legal advisor, or Shariah certification authority.</li>
                  <li>Contracts are governed by California state law.</li>
                  <li>You are responsible for verifying the accuracy of all information entered.</li>
                  <li>AqadChain does not verify vehicle titles, ownership, or the identities of other parties.</li>
                  <li>E-signatures are legally binding under the federal ESIGN Act.</li>
                  <li>Shariah compliance is based on commonly accepted AAOIFI principles but has not been independently certified.</li>
                </ul>
                <p>By proceeding, you agree to the full Terms of Service and Privacy Policy.</p>
              </div>

              <label className="flex items-start space-x-3 mb-8 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-teal-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">I have read and agree to the Terms of Service and Privacy Policy</span>
              </label>

              <Button onClick={handleComplete} loading={loading} size="lg" className="w-full" disabled={!termsAccepted}>
                Complete setup →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
