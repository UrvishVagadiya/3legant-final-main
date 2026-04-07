import { typography } from "@/constants/typography";

export default function PrivacyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 mb-10 text-[#141718]">
      <div className="text-center">
        <h1 className={`${typography.h4} mb-4`}>Privacy Policy</h1>
        <p className={`${typography.text14} text-[#6C7275]`}>
          Last updated: April 6, 2026
        </p>
      </div>

      <div className="space-y-8 mt-10 max-w-5xl">
        <section>
          <h2 className={`${typography.text20Semibold} mb-3`}>Overview</h2>
          <p className={`${typography.text16} text-[#6C7275]`}>
            This Privacy Policy explains how 3legant collects, uses, and
            protects your information when you browse products, create an
            account, and place orders.
          </p>
        </section>

        <section>
          <h2 className={`${typography.text20Semibold} mb-3`}>
            Information We Collect
          </h2>
          <p className={`${typography.text16} text-[#6C7275]`}>
            We may collect account details, shipping and billing information,
            order history, and basic device or usage data required to provide
            and improve our services.
          </p>
        </section>

        <section>
          <h2 className={`${typography.text20Semibold} mb-3`}>
            How We Use Information
          </h2>
          <p className={`${typography.text16} text-[#6C7275]`}>
            We use your information to process orders, provide customer support,
            secure payments, personalize your shopping experience, and maintain
            account security.
          </p>
        </section>

        <section>
          <h2 className={`${typography.text20Semibold} mb-3`}>
            Payments and Security
          </h2>
          <p className={`${typography.text16} text-[#6C7275]`}>
            Payments are handled through trusted third-party providers. We do
            not store full card numbers on our servers.
          </p>
        </section>

        <section>
          <h2 className={`${typography.text20Semibold} mb-3`}>Your Rights</h2>
          <p className={`${typography.text16} text-[#6C7275]`}>
            You can request access, correction, or deletion of your personal
            information by contacting us through our support channels.
          </p>
        </section>

        <section>
          <h2 className={`${typography.text20Semibold} mb-3`}>Contact</h2>
          <p className={`${typography.text16} text-[#6C7275]`}>
            For any privacy-related concerns, please contact the 3legant support
            team from the Contact page.
          </p>
        </section>
      </div>
    </div>
  );
}
