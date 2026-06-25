import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthNavbar } from '../../components/Navbar';
import StepIndicator from '../../components/StepIndicator';
import StepType from './StepType';
import StepVehicle from './StepVehicle';
import StepParties from './StepParties';
import StepTerms from './StepTerms';
import StepReview from './StepReview';

const STEPS = ['Contract Type', 'Vehicle', 'Parties', 'Terms', 'Review'];

const STEP_PATHS = ['type', 'vehicle', 'parties', 'terms', 'review'];

const initialFormData = {
  contract_type: '',
  vehicle_vin: '', vehicle_year: '', vehicle_make: '', vehicle_model: '',
  vehicle_trim: '', vehicle_mileage: '', vehicle_color: '', title_status: '',
  seller_name: '', seller_email: '', seller_phone: '', seller_address: '',
  buyer_name: '', buyer_email: '', buyer_phone: '', buyer_address: '',
  car_price: '', down_payment: '', markup_percentage: '5',
  apr: '0', term_months: '24', payment_frequency: 'MONTHLY',
  payment_start_date: '', late_fee_amount: '25',
  charity_name: '', special_terms: '',
  financed_amount: '', markup_amount: '', monthly_payment: '', total_payable: '',
  // Ijarah-specific
  ijarah_subtype: 'OPERATING', security_deposit: '', residual_value: '',
};

export default function ContractNew() {
  const location = useLocation();
  const prefill = location.state?.prefill;
  const [formData, setFormData] = useState(prefill ? { ...initialFormData, ...prefill } : initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const updateForm = (fields) => setFormData((prev) => ({ ...prev, ...fields }));

  const goToStep = (step) => {
    setCurrentStep(step);
    navigate(`/contracts/new/${STEP_PATHS[step - 1]}`);
  };

  const stepProps = { formData, updateForm, goToStep, currentStep };

  return (
    <div className="min-h-screen bg-gray-100">
      <AuthNavbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-heading text-gray-900 mb-1">Create New Contract</h1>
          <p className="text-gray-500 text-sm">Complete each step to generate your Halal vehicle financing contract.</p>
        </div>
        <StepIndicator steps={STEPS} currentStep={currentStep} />
        <Routes>
          <Route path="type" element={<StepType {...stepProps} />} />
          <Route path="vehicle" element={<StepVehicle {...stepProps} />} />
          <Route path="parties" element={<StepParties {...stepProps} />} />
          <Route path="terms" element={<StepTerms {...stepProps} />} />
          <Route path="review" element={<StepReview {...stepProps} />} />
          <Route path="*" element={<StepType {...stepProps} />} />
        </Routes>
      </div>
    </div>
  );
}
