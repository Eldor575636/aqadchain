import { PublicNavbar } from '../components/Navbar';
import Footer from '../components/Footer';
import Accordion from '../components/Accordion';

const sections = [
  {
    category: 'About Halal Financing',
    items: [
      { question: 'What makes a car financing contract Halal?', answer: 'A Halal (permissible) financing contract avoids Riba (interest). Instead of a loan with interest, the seller and buyer agree on a sale price with a fixed markup. The buyer pays in installments. The profit comes from a genuine sale, not from lending money.' },
      { question: 'What is Murabaha?', answer: 'Murabaha is a cost-plus sale structure where the seller discloses their actual purchase cost and agrees on a fixed profit margin with the buyer. The buyer pays the total (cost + markup) in deferred installments. No interest is charged.' },
      { question: 'What is Musawama?', answer: 'Musawama is a negotiated-price sale where both parties agree on a final price without the seller disclosing their cost. It is equally Shariah-compliant — cost disclosure is optional under Musawama.' },
      { question: 'Is a markup the same as interest?', answer: 'No. In Islamic finance, the key distinction is that profit comes from a genuine commercial transaction (buying and selling a tangible asset) rather than from lending money over time. The markup is agreed upon upfront and fixed — it does not grow if the buyer is late (unlike interest). Late fees are donated to charity, not kept as income.' },
    ],
  },
  {
    category: 'Using AqadChain',
    items: [
      { question: 'Do I need a lawyer to use AqadChain?', answer: 'No. AqadChain generates a complete, legally structured contract automatically. You do not need to hire a lawyer to create or sign a contract on our platform. However, for large transactions, legal counsel is always a prudent choice.' },
      { question: 'How does e-signing work?', answer: 'After you create a contract, both parties receive an email from DocuSign — the industry-leading e-signature provider. They click the link, review the contract, and sign electronically. Signatures are legally binding under the ESIGN Act.' },
      { question: 'Can both parties sign from their phones?', answer: 'Yes. DocuSign works on any device — phone, tablet, or desktop. No app download is required.' },
      { question: 'What happens after both parties sign?', answer: 'The signed PDF is securely stored and emailed to both parties. It is also accessible from your AqadChain dashboard for download at any time.' },
    ],
  },
  {
    category: 'Contracts and Compliance',
    items: [
      { question: 'Is this legally enforceable in California?', answer: 'Yes. AqadChain contracts are structured as standard deferred-payment sale agreements governed by California law. They include all legally required clauses for secured vehicle sales and are executed via compliant e-signatures.' },
      { question: 'Does AqadChain provide Shariah certification?', answer: 'No. AqadChain is a software platform that provides contract templates inspired by AAOIFI Islamic finance standards. We do not issue fatwas or Shariah certifications. Users should consult a qualified Shariah advisor for religious guidance.' },
      { question: 'What is the maximum markup percentage?', answer: 'AqadChain caps markup at 15% to prevent predatory terms. This is a platform-level safeguard — parties may agree on any lower markup.' },
      { question: 'How does the late fee work without charging interest?', answer: 'If a payment is more than 30 days late, a fixed daily fee applies — but the seller does not keep this fee. It is donated to a charity both parties agreed on at signing. This creates accountability without the seller profiting from tardiness (which would resemble Riba).' },
    ],
  },
];

export default function FAQ() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <div className="flex-1 py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold font-heading text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-gray-500">Everything you need to know about AqadChain and Halal vehicle financing.</p>
          </div>

          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.category}>
                <h2 className="text-lg font-bold font-heading text-gray-900 mb-4">{section.category}</h2>
                <Accordion items={section.items} />
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">Still have questions?</p>
            <a href="mailto:support@aqadchain.com" className="text-teal-600 font-semibold hover:underline text-sm">Contact us at support@aqadchain.com</a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
