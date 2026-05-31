import React from "react";
import GlobalNavbar from "../../components/ui/GlobalNavbar";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <GlobalNavbar />

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Last updated: April 3, 2026
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when
              you create or modify your account, request on-demand services,
              contact customer support, or otherwise communicate with us. This
              information may include: name, email, phone number, postal
              address, profile picture, payment method, and other information
              you choose to provide.
            </p>
            <br />
            <h2>2. How We Use Your Information</h2>
            <p>
              We use the information we collect about you to provide, maintain,
              and improve our services, such as to facilitate payments, send
              receipts, provide products and services you request, develop new
              features, provide customer support, and authenticate users.
            </p>
            <br />
            <h2>3. Sharing of Information</h2>
            <p>
              We may share the information we collect about you as described in
              this Statement or as described at the time of collection or
              sharing, including as follows: with Event Organizers (for events
              you register for), with third-party service providers, and in
              response to a legal request.
            </p>
            <br />
            <h2>4. Data Security</h2>
            <p>
              We take reasonable measures to help protect information about you
              from loss, theft, misuse and unauthorized access, disclosure,
              alteration and destruction.
            </p>
            <br />
            <h2>5. Your Choices</h2>
            <p>
              You may correct your account information at any time by logging
              into your online or in-app account. If you wish to cancel your
              account, please email us. Please note that in some cases we may
              retain certain information about you as required by law, or for
              legitimate business purposes to the extent permitted by law.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
