import Breadcrumbs from '../components/Breadcrumbs';

const PrivacyPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Home', link: '/' }, { label: 'Privacy Policy' }]} />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose max-w-none bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>
              <p className="mb-4">
                At GOFTORA TRADING PRIVATE LIMITED ("we," "us," or "our"), we are committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit 
                our website and use our services.
              </p>
              <p className="mb-4"><strong>Last Updated:</strong> May 2025</p>
              <p className="mb-4">
                By using our website, you consent to the data practices described in this policy. If you do not agree 
                with the practices described in this policy, please do not use our website.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">1. Information We Collect</h3>
              <p className="mb-4">
                We collect information that you provide directly to us and information that is automatically collected 
                when you use our website.
              </p>
              
              <h4 className="text-lg font-semibold mb-2 mt-4">1.1 Information You Provide</h4>
              <p className="mb-4">We collect information that you provide when you:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Create an Account:</strong> Name, email address, phone number, password</li>
                <li><strong>Make a Purchase:</strong> Billing address, shipping address, payment information, order details</li>
                <li><strong>Contact Us:</strong> Name, email address, phone number, message content</li>
                <li><strong>Subscribe to Newsletter:</strong> Email address</li>
                <li><strong>Participate in Surveys or Promotions:</strong> Information you choose to provide</li>
              </ul>

              <h4 className="text-lg font-semibold mb-2 mt-4">1.2 Automatically Collected Information</h4>
              <p className="mb-4">When you visit our website, we automatically collect certain information:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Usage Information:</strong> Pages visited, time spent on pages, click patterns, search queries</li>
                <li><strong>Location Information:</strong> General location based on IP address</li>
                <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar technologies to enhance your experience</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">2. How We Use Your Information</h3>
              <p className="mb-4">We use the information we collect for various purposes:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Order Processing:</strong> To process and fulfill your orders, send order confirmations, and provide customer support</li>
                <li><strong>Account Management:</strong> To create and manage your account, authenticate your identity</li>
                <li><strong>Communication:</strong> To send you updates about your orders, respond to your inquiries, and send marketing communications (with your consent)</li>
                <li><strong>Improvement of Services:</strong> To analyze website usage, improve our products and services, and enhance user experience</li>
                <li><strong>Security:</strong> To detect, prevent, and address fraud, security issues, and other harmful activities</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our terms and conditions</li>
                <li><strong>Personalization:</strong> To personalize your shopping experience and show you relevant products</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">3. Information Sharing and Disclosure</h3>
              <p className="mb-4">We do not sell your personal information. We may share your information in the following circumstances:</p>
              
              <h4 className="text-lg font-semibold mb-2 mt-4">3.1 Service Providers</h4>
              <p className="mb-4">We may share information with third-party service providers who perform services on our behalf:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Payment processors for transaction processing</li>
                <li>Shipping and logistics companies for order delivery</li>
                <li>Email service providers for sending communications</li>
                <li>Analytics providers for website analysis</li>
                <li>Customer support service providers</li>
              </ul>
              <p className="mb-4">
                These service providers are contractually obligated to protect your information and use it only for the 
                purposes we specify.
              </p>

              <h4 className="text-lg font-semibold mb-2 mt-4">3.2 Legal Requirements</h4>
              <p className="mb-4">
                We may disclose your information if required by law or in response to valid requests by public authorities.
              </p>

              <h4 className="text-lg font-semibold mb-2 mt-4">3.3 Business Transfers</h4>
              <p className="mb-4">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the 
                acquiring entity.
              </p>

              <h4 className="text-lg font-semibold mb-2 mt-4">3.4 With Your Consent</h4>
              <p className="mb-4">
                We may share your information with third parties when you explicitly consent to such sharing.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">4. Cookies and Tracking Technologies</h3>
              <p className="mb-4">We use cookies and similar tracking technologies to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Remember your preferences and settings</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Provide personalized content and advertisements</li>
                <li>Improve website functionality and user experience</li>
              </ul>
              <p className="mb-4">
                You can control cookies through your browser settings. However, disabling cookies may limit your ability 
                to use certain features of our website.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">5. Data Security</h3>
              <p className="mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>SSL encryption for data transmission</li>
                <li>Secure servers and databases</li>
                <li>Access controls and authentication</li>
                <li>Regular security assessments and updates</li>
                <li>Employee training on data protection</li>
              </ul>
              <p className="mb-4">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive 
                to protect your information, we cannot guarantee absolute security.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">6. Data Retention</h3>
              <p className="mb-4">We retain your personal information for as long as necessary to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Fulfill the purposes for which it was collected</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Maintain business records as required by law</li>
              </ul>
              <p className="mb-4">When we no longer need your information, we will securely delete or anonymize it.</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">7. Your Rights and Choices</h3>
              <p className="mb-4">You have certain rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Access:</strong> You can request access to your personal information</li>
                <li><strong>Correction:</strong> You can update or correct your information through your account settings</li>
                <li><strong>Deletion:</strong> You can request deletion of your account and personal information</li>
                <li><strong>Opt-Out:</strong> You can opt-out of marketing communications by clicking unsubscribe links or contacting us</li>
                <li><strong>Data Portability:</strong> You can request a copy of your data in a portable format</li>
                <li><strong>Withdraw Consent:</strong> You can withdraw consent for data processing where applicable</li>
              </ul>
              <p className="mb-4">
                To exercise these rights, please contact us at{' '}
                <a href="mailto:" className="text-primary-600 hover:underline">
                  
                </a>
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">8. Children's Privacy</h3>
              <p className="mb-4">
                Our website is not intended for children under the age of 18. We do not knowingly collect personal 
                information from children. If you believe we have collected information from a child, please contact us 
                immediately, and we will delete such information.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">9. Third-Party Links</h3>
              <p className="mb-4">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices 
                of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">10. Changes to This Privacy Policy</h3>
              <p className="mb-4">We may update this Privacy Policy from time to time. We will notify you of any material changes by:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Posting the updated policy on our website</li>
                <li>Sending an email notification (if you have provided your email)</li>
                <li>Updating the "Last Updated" date</li>
              </ul>
              <p className="mb-4">
                Your continued use of our website after changes are posted constitutes acceptance of the updated policy.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">11. International Data Transfers</h3>
              <p className="mb-4">
                Your information may be transferred to and processed in countries other than India. We ensure that 
                appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">12. Contact Us</h3>
              <p className="mb-2">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                please contact us:
              </p>
              <p className="mb-2"><strong>GOFTORA TRADING PRIVATE LIMITED</strong></p>
              <p className="mb-2">
                PLOT NO E-260 B-A, Balongi, Rupnagar<br />
                SECTOR-74, PH-8B, INDL AREA<br />
                Mohali District: SAS Nagar State: Punjab 160055<br />
                India
              </p>
              <p className="mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:" className="text-primary-600 hover:underline">
                  
                </a>
              </p>
              <p className="mb-4">
                <strong>Phone:</strong>{' '}
                <a href="tel:" className="text-primary-600 hover:underline">
                  
                </a>
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="mb-2">
                <strong>
                  By using our website, you acknowledge that you have read and understood this Privacy Policy and 
                  consent to the collection, use, and disclosure of your information as described herein.
                </strong>
              </p>
              <p>If you do not agree with this Privacy Policy, please do not use our website or services.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
