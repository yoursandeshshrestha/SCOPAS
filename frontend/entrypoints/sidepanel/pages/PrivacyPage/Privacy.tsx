import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Privacy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full bg-[var(--bg-dark)] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[var(--bg-dark)] border-b border-gray-800 z-10">
        <div className="flex items-center px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-medium text-white ml-4">
            Privacy Policy
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 max-w-2xl">
        <div className="space-y-6 text-gray-400 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-medium text-base mb-3">
              1. Information We Collect
            </h2>
            <p>
              We collect information that you provide directly to us, including
              when you create an account, use our services, or communicate with
              us. This may include:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Name and email address</li>
              <li>Account credentials</li>
              <li>Profile information</li>
              <li>Communications with us</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-medium text-base mb-3">
              2. How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends and usage</li>
              <li>
                Detect, prevent, and address technical issues and security
                threats
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-medium text-base mb-3">
              3. Information Sharing
            </h2>
            <p>
              We do not share your personal information with third parties
              except in the following circumstances:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
              <li>
                With service providers who assist in our operations under
                confidentiality agreements
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-medium text-base mb-3">
              4. Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. However, no method of
              transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-base mb-3">
              5. Data Retention
            </h2>
            <p>
              We retain your personal information for as long as necessary to
              fulfill the purposes outlined in this privacy policy, unless a
              longer retention period is required or permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-base mb-3">
              6. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Object to processing of your information</li>
              <li>Request data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-medium text-base mb-3">
              7. Cookies and Tracking
            </h2>
            <p>
              We use cookies and similar tracking technologies to track activity
              on our service and hold certain information. You can instruct your
              browser to refuse all cookies or to indicate when a cookie is
              being sent.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-base mb-3">
              8. Changes to This Policy
            </h2>
            <p>
              We may update our privacy policy from time to time. We will notify
              you of any changes by posting the new privacy policy on this page
              and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-base mb-3">
              9. Contact Us
            </h2>
            <p>
              If you have any questions about this privacy policy, please
              contact us through the appropriate channels provided in our
              service.
            </p>
          </section>

          <div className="pt-4 pb-8">
            <p className="text-gray-500 text-xs">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
