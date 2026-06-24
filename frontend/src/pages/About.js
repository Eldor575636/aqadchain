import { PublicNavbar } from '../components/Navbar';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <div className="flex-1">
        <section className="bg-white py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold font-heading text-gray-900 mb-4">About AqadChain</h1>
            <p className="text-xl text-gray-500 mb-10">Making Halal vehicle financing accessible to every Muslim in America.</p>

            <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
              <h2 className="text-2xl font-bold font-heading text-gray-900">Our Mission</h2>
              <p>Muslim Americans who want to finance vehicle purchases without Riba (interest) have historically had few options. Traditional auto loans involve interest — forbidden under Islamic law. Community-based arrangements exist but often lack legal structure, leaving both buyer and seller exposed.</p>
              <p>AqadChain was built to solve this. We provide the tools to create legally binding, Shariah-inspired vehicle financing contracts between individuals — with professional e-signatures, secure storage, and a guided experience that takes minutes, not days.</p>

              <h2 className="text-2xl font-bold font-heading text-gray-900 mt-8">Our Approach to Shariah Compliance</h2>
              <p>We take a practical, transparent approach. Our contracts are modeled on the Murabaha and Musawama structures described in AAOIFI Shari'ah Standards — the most widely referenced Islamic finance standards globally.</p>
              <p>We are upfront that AqadChain is a software platform, not a Shariah certification body. We do not issue fatwas. We provide a legally enforceable contract framework inspired by Islamic finance principles, and we encourage users to consult a qualified Shariah advisor before entering any transaction.</p>

              <h2 className="text-2xl font-bold font-heading text-gray-900 mt-8">Shariah Advisor</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-card p-6">
                <p className="text-gray-500 text-sm italic">Shariah advisor partnerships are being established. This section will be updated once our advisory board is finalized.</p>
              </div>

              <h2 className="text-2xl font-bold font-heading text-gray-900 mt-8">Starting in the Bay Area</h2>
              <p>We launched AqadChain in the San Francisco Bay Area — home to one of the largest and most diverse Muslim communities in the United States. Our contracts are structured under California law and designed for private-party vehicle sales within the US.</p>

              <h2 className="text-2xl font-bold font-heading text-gray-900 mt-8">Contact</h2>
              <p>Questions, feedback, or partnership inquiries: <a href="mailto:hello@aqadchain.com" className="text-teal-600 hover:underline">hello@aqadchain.com</a></p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
