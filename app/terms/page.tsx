import { typography } from "@/constants/typography";

export default function TermsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 mb-10 text-[#141718]">
      <div className="text-center">
        <h1 className={`${typography.h4} mb-4`}>Terms of Use</h1>
        <p className={`${typography.text14} text-[#6C7275]`}>
          Last updated: April 6, 2026
        </p>
      </div>

      <div className="space-y-8 mt-10 max-w-5xl">
        <section>
          <h2 className={`${typography.text20Semibold} mb-3`}>
            Acceptance of Terms
          </h2>
          <p className={`${typography.text16} text-[#6C7275]`}>
            By using this website, you agree to these Terms of Use and all
            applicable laws and regulations.
          </p>
        </section>

        <section>
          <h2 className={`${typography.text20Semibold} mb-3`}>
            Accounts and Orders
          </h2>
          <p className={`${typography.text16} text-[#6C7275]`}>
            You are responsible for maintaining accurate account information and
            for all activity under your account. Orders are subject to
            availability and confirmation.
          </p>
        </section>

        <section>
          <h2 className={`${typography.text20Semibold} mb-3`}>
            Pricing and Payments
          </h2>
          <p className={`${typography.text16} text-[#6C7275]`}>
            Prices may change without notice. Payment must be completed through
            the available secure payment methods before order fulfillment.
          </p>
        </section>

        <section>
          <h2 className={`${typography.text20Semibold} mb-3`}>
            Prohibited Use
          </h2>
          <p className={`${typography.text16} text-[#6C7275]`}>
            You agree not to misuse the platform, interfere with site security,
            or attempt unauthorized access to systems or user data.
          </p>
        </section>

        <section>
          <h2 className={`${typography.text20Semibold} mb-3`}>
            Limitation of Liability
          </h2>
          <p className={`${typography.text16} text-[#6C7275]`}>
            3legant is not liable for indirect or incidental damages arising
            from the use of this site, to the maximum extent permitted by law.
          </p>
        </section>

        <section>
          <h2 className={`${typography.text20Semibold} mb-3`}>
            Changes to Terms
          </h2>
          <p className={`${typography.text16} text-[#6C7275]`}>
            We may update these terms from time to time. Continued use of the
            platform after updates means you accept the revised terms.
          </p>
        </section>
      </div>
    </div>
  );
}
