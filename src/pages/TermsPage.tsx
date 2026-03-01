import { motion } from 'motion/react';
import Footer from '../components/Footer';
import { Scale } from 'lucide-react';

const sections = [
  {
    title: '1. Introduction',
    content: `Welcome to MotelTrips.com (including our website, mobile site, and any related applications or services, collectively the "Platform"). The Platform is owned and operated by MotelTrips LLC ("MotelTrips," "we," "us," or "our").

These Terms & Conditions ("Terms") govern your access to and use of our Platform, including searching, viewing, reserving, purchasing, booking, or modifying travel services (collectively "Bookings").

By using our Platform, you agree to be legally bound by these Terms and our Privacy Policy (together, the "Agreement"). If you do not agree, please do not use the Platform.`
  },
  {
    title: '2. What MotelTrips Does',
    content: `MotelTrips helps users discover travel options such as hotels, accommodations, rental cars, flights, activities, or other travel services ("Travel Services").

In most cases, we are not the travel provider. The actual services are provided by third-party suppliers such as hotels, airlines, car rental companies, tour providers, and other travel partners ("Suppliers").

Your Booking is typically with the Supplier, and your experience depends on the Supplier's policies and service delivery.`
  },
  {
    title: '3. Eligibility & User Responsibilities',
    content: `By using the Platform, you confirm that:
• You are at least 18 years old (or the legal age in your area).
• You have the legal authority to enter into this Agreement.
• You will provide accurate and complete information for your Bookings.

You are responsible for:
• Reviewing Booking details carefully before confirming
• Ensuring traveler names match ID/passport (if applicable)
• Following Supplier rules and local laws
• Any charges caused by incorrect info you provide`
  },
  {
    title: '4. Account Registration (If Applicable)',
    content: `You may create an account to access certain features. You agree to:
• Keep your login details confidential
• Notify us immediately if you suspect unauthorized access
• Accept responsibility for activity under your account

We may suspend or terminate accounts if we believe there is fraud, abuse, or Terms violations.`
  },
  {
    title: '5. Use of the Platform (Acceptable Use Rules)',
    content: `You agree not to:
• Copy, reproduce, sell, resell, scrape, or exploit Platform content without permission
• Use robots, spiders, scrapers, automated scripts, or AI tools to extract pricing or listings
• Make false or fraudulent Bookings
• Attempt unauthorized access to our systems
• Upload harmful, offensive, illegal, or infringing content
• Interfere with Platform performance or security

We may block, restrict, or terminate access to protect our Platform, users, and Suppliers.`
  },
  {
    title: '6. Pricing, Availability & Search Results',
    subsections: [
      {
        title: '6.1 Pricing and Availability',
        content: `Prices and availability can change at any time due to:
• Supplier inventory changes
• Demand/seasonality
• Currency fluctuations
• Taxes and fees updates

The final price is confirmed during checkout.`
      },
      {
        title: '6.2 Display Order of Results',
        content: `Search results may be sorted using automated ranking based on factors like:
• Price, location, ratings, popularity, and relevance

Some listings may be labeled as Sponsored / Promoted if they are paid placements.`
      },
      {
        title: '6.3 Pricing Errors',
        content: `If a price appears incorrectly due to a typo/system/supplier mistake, we may cancel or correct the Booking. If you were charged, we will issue a refund consistent with the supplier/payment policy.`
      }
    ]
  },
  {
    title: '7. Bookings, Supplier Terms & Important Rules',
    content: `When you make a Booking, you agree to the Supplier's rules ("Supplier Terms"), including:
• Cancellation/no-show rules
• Refund restrictions
• Check-in requirements
• Deposits and incidental charges
• Property policies (pets, smoking, ID requirements)

Supplier Terms apply even if our Platform shows different general info. If Supplier Terms conflict with our summary, the Supplier Terms prevail.`
  },
  {
    title: '8. Payments, Taxes & Fees',
    subsections: [
      {
        title: '8.1 Who Charges You (Merchant of Record)',
        content: `Depending on the Booking type:
• MotelTrips or a partner platform may collect payment (prepaid) OR
• The Supplier charges you directly (pay at property / pay later)

This will be shown clearly at checkout.`
      },
      {
        title: '8.2 Taxes & Mandatory Fees',
        content: `Some taxes and mandatory fees may be:
• Included in the total price
• Collected at checkout
• Collected later by the Supplier (example: resort fees, deposits, city taxes)

You are responsible for all mandatory charges disclosed by the Supplier.`
      },
      {
        title: '8.3 Chargebacks',
        content: `If you dispute a charge without contacting support first, we may provide your Booking information to payment processors to confirm that the Booking was valid and authorized.`
      }
    ]
  },
  {
    title: '9. Changes, Cancellations & Refunds',
    subsections: [
      {
        title: '9.1 User-Requested Changes',
        content: `If your Booking allows modifications, you may request changes through the Platform or Supplier, but fees may apply.`
      },
      {
        title: '9.2 Supplier or MotelTrips Changes',
        content: `If a Supplier changes or cancels a Booking (rare but possible), we will attempt to help you:
• Contact the Supplier
• Find alternatives
• Process refunds if eligible under Supplier Terms`
      },
      {
        title: '9.3 Non-Refundable Bookings',
        content: `Some deals or discounted rates are strictly:
• Non-cancellable
• Non-refundable
• Non-changeable

Even if unused.`
      }
    ]
  },
  {
    title: '10. Travel Risks, Passports & Requirements',
    content: `You are responsible for:
• Valid passport/visa requirements
• COVID/health/travel regulations
• Local laws and entry rules
• Airline baggage rules and check-in requirements

We recommend checking official government travel advisories before travel.`
  },
  {
    title: '11. Third-Party Links & Services',
    content: `Our Platform may redirect you to third-party websites (Suppliers, payment processors, partners). We do not control those sites and are not responsible for their content, privacy practices, or services.`
  },
  {
    title: '12. Intellectual Property',
    content: `All Platform content (logos, text, UI, design, code, graphics, trademarks, and brand identity) belongs to MotelTrips LLC or its licensors and is protected under applicable laws.

You may not use our trademarks or content without written permission.`
  },
  {
    title: '13. User Content (Reviews, Messages, Uploads)',
    content: `If you submit reviews or content ("User Content"), you confirm:
• You own it or have rights to share it
• It's not illegal, abusive, or infringing

By posting User Content, you grant MotelTrips a worldwide, royalty-free license to use, display, reproduce, and distribute it for Platform operations and marketing.`
  },
  {
    title: '14. Disclaimer (No Guarantees)',
    content: `The Platform and content are provided "as is" and "as available." We do not guarantee that:
• The Platform will be error-free or uninterrupted
• Results will always be accurate or up to date
• A Booking will always be confirmed by the Supplier

Suppliers are responsible for delivering the Travel Services.`
  },
  {
    title: '15. Limitation of Liability',
    content: `To the maximum extent allowed by law, MotelTrips is not liable for:
• Supplier service failures (overbooking, closures, quality issues)
• Travel disruptions (weather, strikes, delays, disasters)
• Indirect, incidental, special, or consequential losses
• Loss of profit, revenue, data, or goodwill

If we are found liable in any case, our total liability will not exceed the amount you paid to MotelTrips for the applicable Booking (if any).`
  },
  {
    title: '16. Indemnification',
    content: `You agree to defend, indemnify, and hold MotelTrips LLC harmless from claims, losses, liabilities, damages, and expenses resulting from:
• Your misuse of the Platform
• Your violation of these Terms
• Your violation of Supplier Terms
• Fraud, abuse, or unlawful behavior`
  },
  {
    title: '17. Privacy Policy',
    content: `Your use of the Platform is also governed by our Privacy Policy, which explains how we collect and use data.`
  },
  {
    title: '18. Disputes, Governing Law & Venue',
    content: `These Terms are governed by the laws of the State of Texas, without regard to conflicts of law rules.

Any disputes not subject to arbitration (if enabled below) must be brought in the state or federal courts located in Texas, unless otherwise required by law.`
  },
  {
    title: '19. Arbitration & Class Action Waiver',
    content: `Any dispute or claim arising out of or related to these Terms or the Platform shall be resolved by binding arbitration, except where small claims court is allowed.

You agree not to participate in a class action against MotelTrips LLC.

Opt-out right: You may opt out of arbitration within 30 days by emailing: legal@moteltrips.com with your name + email + statement: "I opt out of arbitration."`
  },
  {
    title: '20. Changes to These Terms',
    content: `We may update these Terms at any time by posting a revised version on MotelTrips.com. Continued use of the Platform means you accept the updated Terms.`
  }
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-6">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl mb-4 font-black">
            Terms & Conditions
          </h1>
          <p className="text-lg text-blue-100">
            Last updated: January 28, 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <p className="text-lg text-gray-700 leading-relaxed">
              Welcome to MotelTrips.com. These Terms and Conditions govern your access to and use of our Platform, including searching, viewing, reserving, purchasing, booking, or modifying travel services. By accessing and using MotelTrips.com, you agree to be legally bound by these Terms and our Privacy Policy. If you do not agree to these terms, please do not use our services.
            </p>
          </div>

          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={index} className="border-b border-gray-200 pb-8 last:border-b-0">
                <h3 className="text-2xl mb-3 font-black text-gray-900">{section.title}</h3>
                {section.content && (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{section.content}</p>
                )}
                {section.subsections && (
                  <div className="space-y-6 mt-6">
                    {section.subsections.map((subsection, subIndex) => (
                      <div key={subIndex}>
                        <h4 className="text-lg font-bold text-gray-800 mb-2">{subsection.title}</h4>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{subsection.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-2xl mb-4 font-black text-gray-900">Questions?</h3>
            <p className="text-gray-700 mb-6">
              If you have any questions about these Terms and Conditions, please don't hesitate to contact us.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="mailto:support@moteltrips.com"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all"
              >
                Email Support
              </a>
              <a
                href="tel:+1 (726) 206-1009"
                className="border-2 border-cyan-500 text-cyan-600 px-6 py-3 rounded-xl font-semibold hover:bg-cyan-50 transition-all"
              >
                Call Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}