import { motion } from 'motion/react';
import Footer from '../components/Footer';
import { Shield, Lock, UserCheck, Database } from 'lucide-react';

const sections = [
  {
    title: 'Summary of Key Points',
    content: `Collection: We collect personal data you provide to us and data collected automatically when you use our Site.
Protection: We use technical, administrative, and physical safeguards to protect your information.
Use: We use data to process bookings, provide customer service, improve features, and communicate with you.
Sharing: We share data with travel suppliers, payment processors, service providers, and legal authorities when required.
Marketing Choices: You can opt out of promotional emails anytime.
Cookies: We use cookies to run the Site, personalize your experience, and run analytics/ads (if enabled).
Your Rights: You may request access, correction, or deletion of your personal data depending on your location.
Children: Our Site is not intended for users under 18 years old.`
  },
  {
    title: '1. Personal Data We Collect',
    subsections: [
      {
        title: '1.1 Personal Data You Provide',
        content: `Identifiers & Contact Information
• Full name
• Email address
• Phone number
• Billing address
• Account username and password (if you create an account)

Booking Details
• Traveler names
• Reservation details (hotel/property, dates, guests, preferences)
• Special requests (if submitted)

Payment Information
• Payment card details (processed securely by payment providers)
• Billing details and transaction history

Note: We do not store full credit card numbers directly on our servers when payment is handled by third-party processors.

Communications
• Messages you send to support
• Emails, chat requests, and feedback`
      },
      {
        title: '1.2 Data Collected Automatically',
        content: `When you use our Site, we may automatically collect:
• IP address
• Device identifiers
• Browser type and settings
• Operating system
• Pages visited, clicks, and time spent
• Search preferences and interaction history
• General location (based on IP)`
      },
      {
        title: '1.3 Data From Other Sources',
        content: `We may also receive personal data from:
• Travel suppliers and booking partners
• Payment processors
• Affiliate networks or marketing partners
• Social logins (Google/Apple/Facebook) if enabled
• A person booking on your behalf

If you book for someone else, you confirm that you have permission to provide their data.`
      }
    ]
  },
  {
    title: '2. How We Protect Your Personal Data',
    content: `We use safeguards designed to protect your data from loss, misuse, unauthorized access, disclosure, alteration, and destruction.

These may include:
• Secure encryption (SSL/HTTPS) during data transmission
• Access controls and restricted internal access
• Monitoring for suspicious activity
• Secure hosting environments

If you believe your account is compromised, contact us immediately at: privacy@moteltrips.com`
  },
  {
    title: '3. How We Use Your Personal Data',
    subsections: [
      {
        title: 'Provide and Manage Services',
        content: `• Process bookings and confirmations
• Send itinerary details
• Provide customer support
• Manage cancellations or changes (as allowed by supplier policy)`
      },
      {
        title: 'Improve Our Site',
        content: `• Enhance user experience
• Fix errors and performance issues
• Develop new features and products`
      },
      {
        title: 'Communications',
        content: `• Send booking-related messages
• Service updates and important notices
• Promotional offers (only if permitted by law)`
      },
      {
        title: 'Security & Fraud Prevention',
        content: `• Detect fraud, abuse, and unauthorized access
• Protect users and our platform`
      },
      {
        title: 'Legal Compliance',
        content: `• Meet legal or tax obligations
• Resolve disputes and enforce our Terms

Legal Basis (Where Required)

If required by applicable laws (such as GDPR-type rules), our legal basis may include:
• Performing a contract (processing your booking)
• Legitimate interests (improving services, preventing fraud)
• Consent (marketing or optional cookies)
• Legal obligations (record-keeping, compliance)`
      }
    ]
  },
  {
    title: '4. How We Share Your Personal Data',
    subsections: [
      {
        title: '4.1 Travel Suppliers',
        content: `We share booking data with hotels, airlines, car rental companies, and other travel suppliers to complete your reservation.

Suppliers may have their own privacy policies, and their processing is governed by their own practices.`
      },
      {
        title: '4.2 Service Providers & Vendors',
        content: `We may share data with trusted providers that help us operate, such as:
• Hosting and cloud providers
• Customer support tools
• Analytics providers
• Marketing email providers
• Fraud prevention services

These providers may only process data under our instructions for business purposes.`
      },
      {
        title: '4.3 Payment Processing',
        content: `Payments are handled securely by third-party payment processors. We share necessary information to process transactions, prevent fraud, and handle refunds.`
      },
      {
        title: '4.4 Business Transfers',
        content: `If MotelTrips LLC is involved in a merger, acquisition, restructuring, or asset sale, your Personal Data may be transferred as part of that transaction, subject to applicable legal protections.`
      },
      {
        title: '4.5 Legal Requirements',
        content: `We may disclose Personal Data if required to:
• comply with laws or legal processes
• respond to court orders or subpoenas
• enforce our Terms
• protect rights, safety, and security of MotelTrips, users, or others`
      }
    ]
  },
  {
    title: '5. Marketing Choices & Communications',
    content: `You may receive promotional communications from us if allowed by law.

You can opt out anytime by:
• clicking "unsubscribe" in emails
• updating your account preferences (if available)
• contacting us at: privacy@moteltrips.com

Even if you opt out of marketing emails, we may still send:
• booking confirmations
• important service messages
• security notices`
  },
  {
    title: '6. Cookies & Tracking Technologies',
    subsections: [
      {
        title: '6.1 First-Party Cookies (Essential)',
        content: `Used for:
• login sessions
• remembering preferences
• security and fraud prevention
• smooth checkout experience`
      },
      {
        title: '6.2 Analytics Cookies (Optional)',
        content: `Used to understand:
• which pages are visited
• how users interact with our Site
• performance improvements`
      },
      {
        title: '6.3 Advertising Cookies (Optional, If Enabled)',
        content: `Used by advertising partners to:
• show relevant ads
• measure campaigns
• personalize offers

Managing Cookies

You can control cookies using:
• your browser settings (block/delete cookies)
• device settings (mobile ad tracking controls)

Disabling cookies may reduce functionality of the Site.`
      }
    ]
  },
  {
    title: '7. Your Data Rights (Access, Update, Delete)',
    content: `Depending on where you live, you may have rights to:
• Access your personal data
• Correct inaccurate data
• Delete your personal data (with exceptions)
• Restrict or object to processing
• Withdraw consent (where applicable)

To request any of these, contact: privacy@moteltrips.com

For security, we may need to verify your identity before processing requests.`
  },
  {
    title: '8. Data Retention',
    content: `We keep your data only as long as needed for:
• providing services
• legal obligations (tax, fraud, dispute resolution)
• enforcing agreements

When data is no longer required, we securely delete or anonymize it.`
  },
  {
    title: '9. Cross-Border Data Transfers',
    content: `MotelTrips.com is operated in the United States. If you access our Site from outside the U.S., your data may be transferred to and processed in the United States, where privacy laws may differ from your country.

By using our Site, you consent to this transfer where allowed by law.`
  },
  {
    title: '10. Children',
    content: `Our services are not intended for children under 18. We do not knowingly collect personal data from children. If you believe a child has provided us personal data, contact us immediately at privacy@moteltrips.com.`
  },
  {
    title: '11. Links to Third-Party Websites',
    content: `Our Site may contain links to third-party websites such as hotels, suppliers, payment pages, or partners.

We are not responsible for the privacy practices of those sites. Always review their policies when you leave MotelTrips.com.`
  },
  {
    title: '12. Changes to This Policy',
    content: `We may update this Privacy & Cookies Policy to reflect:
• legal requirements
• changes in services
• new tools or security practices

If changes are significant, we may notify you through:
• a notice on the Site
• email (if applicable)`
  }
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl mb-4 font-black">
            Privacy & Cookies Policy
          </h1>
          <p className="text-lg text-blue-100">
            Your privacy is our priority • Last updated: January 28, 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 pb-8 border-b border-gray-200">
            <div className="flex items-start gap-4">
              <Lock className="w-6 h-6 text-cyan-600 shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl mb-3 font-black text-gray-900">Your Privacy Matters</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Your privacy and the security of your information are extremely important to us. By using MotelTrips.com, you trust us with your data, and we take that responsibility seriously. This Privacy & Cookies Policy explains how we collect, use, share, store, and protect your personal data when you use our Site, services, and related communications.
                </p>
              </div>
            </div>
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

          {/* Security Highlights */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-2xl mb-6 font-black text-gray-900">Our Security Commitments</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: Lock, text: 'SSL Encryption' },
                { icon: Shield, text: 'PCI Compliant' },
                { icon: UserCheck, text: 'GDPR Ready' },
                { icon: Database, text: 'Secure Servers' }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-2xl mb-4 font-black text-gray-900">Privacy Questions?</h3>
            <p className="text-gray-700 mb-6">
              If you have any questions or concerns about our Privacy Policy or how we handle your data, we're here to help.
            </p>
            <a
              href="mailto:privacy@moteltrips.com"
              className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all"
            >
              Contact Privacy Team
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}