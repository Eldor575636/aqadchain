import { useAuth0 } from '@auth0/auth0-react';
import { PublicNavbar } from '../components/Navbar';
import Footer from '../components/Footer';

export default function HowItWorks() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <div className="flex-1">

        {/* Hero */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-extrabold font-heading text-gray-900 mb-4">How AqadChain Works</h1>
            <p className="text-gray-500 text-lg">A step-by-step guide to creating your Halal vehicle financing contract.</p>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto space-y-12">
            {[
              {
                num: '01', title: 'Create an account',
                body: 'Sign up with Google or your email. Account creation takes under a minute. After signup, a short onboarding flow explains how the platform works.',
              },
              {
                num: '02', title: 'Choose your contract type',
                body: 'Select Murabaha (cost-plus, cost disclosed to buyer) or Musawama (negotiated price, no cost disclosure required). Both are valid Shariah-compliant structures.',
              },
              {
                num: '03', title: 'Enter vehicle details',
                body: 'Type in the VIN and we\'ll auto-fill the year, make, model, and trim using the free NHTSA public database. We also check for any active safety recalls and show you a warning badge.',
              },
              {
                num: '04', title: 'Add buyer and seller information',
                body: 'Enter names, emails, phone numbers, and addresses for both parties. If you\'re the seller, your account details can be auto-filled.',
              },
              {
                num: '05', title: 'Set deal terms',
                body: 'Enter the car price, down payment, markup percentage (capped at 25%), financing term, and payment frequency. A live calculator shows the monthly payment and total payable amount as you type.',
              },
              {
                num: '06', title: 'Review the contract',
                body: 'Preview the full contract document before sending — including the payment schedule, all clauses, and your signature blocks. Make any edits needed.',
              },
              {
                num: '07', title: 'Send for e-signatures',
                body: 'With one click, both parties receive a DocuSign link by email. They can sign from any device — no printing, scanning, or in-person meeting required.',
              },
              {
                num: '08', title: 'Signed and done',
                body: 'Once both parties sign, the completed PDF is securely stored and accessible from your dashboard. You\'ll receive a confirmation email with a link to download.',
              },
            ].map((step) => (
              <div key={step.num} className="flex gap-6">
                <div className="text-5xl font-extrabold text-teal-100 font-heading leading-none flex-shrink-0 w-16">{step.num}</div>
                <div className="pt-1">
                  <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contract types explained */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-heading text-gray-900 mb-10 text-center">Contract types explained</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border border-teal-200 rounded-card p-6 bg-teal-50">
                <h3 className="text-xl font-bold font-heading text-teal-800 mb-3">Murabaha</h3>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  In a Murabaha transaction, the seller discloses their actual purchase price and the buyer agrees to a fixed markup above that price. The final selling price is the cost plus the agreed markup.
                </p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  <strong>Example:</strong> Seller purchased a car for $20,000. They agree on a 10% markup ($2,000). The buyer pays $22,000 total — typically in monthly installments over 24–60 months.
                </p>
              </div>
              <div className="border border-gold-200 rounded-card p-6 bg-gold-50">
                <h3 className="text-xl font-bold font-heading text-gray-800 mb-3">Musawama</h3>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  Musawama is a general sale where both parties negotiate and agree on a price without the seller being required to disclose their cost. It's the same end result, but without mandatory cost transparency.
                </p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  <strong>Example:</strong> A buyer and seller agree the car is worth $22,000. No cost disclosure is required. Buyer pays in installments. Equally valid under Islamic finance principles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Late fee mechanic */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold font-heading text-gray-900 mb-6 text-center">The charitable late fee</h2>
            <div className="bg-white rounded-card border border-gray-200 p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                Traditional interest on late payments is Riba (forbidden in Islam). AqadChain handles this through a <strong>charitable penalty</strong>: if a buyer is more than 30 days late on a payment, a fixed daily fee applies.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Critically, <strong>the seller does not keep this fee as income</strong>. It is donated to a charity that both parties agree on at the time of signing. This creates accountability (late fees are real consequences) without the seller profiting from tardiness.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The charity is chosen during contract creation and written into the contract. Common choices include local mosques, Islamic Relief, Zakat Foundation, or any 501(c)(3) of the parties' choice.
              </p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-12 px-4 bg-white border-t border-gray-200">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong>Shariah Compliance Disclaimer:</strong> AqadChain provides software tools only and does not issue fatwas or Shariah certifications. The contract structures are inspired by AAOIFI standards but have not been certified by a Shariah board. Users are encouraged to consult a qualified Shariah advisor before entering into any transaction. Contracts are legally governed by California state law.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 bg-teal-600">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold font-heading mb-4">Ready to get started?</h2>
            <p className="text-teal-100 mb-8">Create your first Halal vehicle financing contract in minutes.</p>
            <button onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })} className="bg-white text-teal-700 font-bold px-8 py-3 rounded-btn hover:bg-teal-50 transition-colors">
              Create a free account
            </button>
          </div>
        </section>

      </div>
      <Footer />
    </div>
  );
}
