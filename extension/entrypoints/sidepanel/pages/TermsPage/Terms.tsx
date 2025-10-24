import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms: React.FC = () => {
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
            Terms and Conditions
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 max-w-2xl">
        <div className="space-y-6 text-gray-400 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-medium text-base mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using this service, you accept and agree to be
              bound by the terms and provision of this agreement. If you do not
              agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-base mb-3">
              2. Use License
            </h2>
            <p>
              Permission is granted to temporarily download one copy of the
              materials (information or software) on our service for personal,
              non-commercial transitory viewing only. This is the grant of a
              license, not a transfer of title, and under this license you may
              not:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>modify or copy the materials</li>
              <li>
                use the materials for any commercial purpose or for any public
                display
              </li>
              <li>
                attempt to decompile or reverse engineer any software contained
                on the service
              </li>
              <li>
                remove any copyright or other proprietary notations from the
                materials
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-medium text-base mb-3">
              3. User Account
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              account and password. You agree to accept responsibility for all
              activities that occur under your account or password.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-base mb-3">
              4. Disclaimer
            </h2>
            <p>
              The materials on our service are provided on an 'as is' basis. We
              make no warranties, expressed or implied, and hereby disclaim and
              negate all other warranties including, without limitation, implied
              warranties or conditions of merchantability, fitness for a
              particular purpose, or non-infringement of intellectual property
              or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-base mb-3">
              5. Limitations
            </h2>
            <p>
              In no event shall we or our suppliers be liable for any damages
              (including, without limitation, damages for loss of data or
              profit, or due to business interruption) arising out of the use or
              inability to use the materials on our service.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-base mb-3">
              6. Revisions
            </h2>
            <p>
              We may revise these terms of service at any time without notice.
              By using this service you are agreeing to be bound by the then
              current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-base mb-3">
              7. Governing Law
            </h2>
            <p>
              These terms and conditions are governed by and construed in
              accordance with applicable laws and you irrevocably submit to the
              exclusive jurisdiction of the courts in that location.
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

export default Terms;
