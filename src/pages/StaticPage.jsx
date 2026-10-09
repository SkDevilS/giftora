import { useLocation } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';

const COMPANY_NAME = 'GOFTORA TRADING PRIVATE LIMITED';
const EMAIL = '';
const MOBILE = '';
const ADDRESS_LINE1 = 'PLOT NO E-260 B-A, Balongi, Rupnagar';
const ADDRESS_LINE2 = 'SECTOR-74, PH-8B, INDL AREA';
const ADDRESS_LINE3 = 'Mohali District: SAS Nagar State: Punjab 160055';
const ADDRESS_LINE4 = 'India';

const StaticPage = () => {
  const location = useLocation();
  const slug = location.pathname.substring(1);

  const content = {
    about: {
      title: 'About Us',
      content: `
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold mb-4">Welcome to Goftora Trading</h2>
            <p class="mb-4">Based in Mohali, Punjab, GOFTORA TRADING PRIVATE LIMITED is a dynamic company dedicated to the distribution and sale of a wide range of cosmetics, beauty, and personal care products.</p>
            <p class="mb-4">Our mission is to make premium cosmetics and beauty products accessible and affordable for everyone. Whether it's skincare, makeup, haircare, or daily-use personal care brands — we ensure variety, value, and quality under one roof.</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">Our Vision</h3>
            <p class="mb-4">To become a leading name in the cosmetics distribution and retail sector by offering diverse, high-quality beauty products that enhance everyday living, while maintaining a strong presence in Mohali and across India.</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">Our Mission</h3>
            <p class="mb-4">To deliver excellence in product availability, affordability, and service — ensuring every customer finds the right cosmetics and beauty products with complete satisfaction.</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">What We Stand For</h3>
            <ul class="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Customer-Centric:</strong> We prioritize customer satisfaction by helping people find the right beauty and skincare products for their needs.</li>
              <li><strong>Quality Assurance:</strong> Every cosmetic product is carefully sourced from trusted manufacturers and licensed brands.</li>
              <li><strong>Innovation:</strong> Continuously expanding our portfolio with the latest beauty trends and innovations.</li>
              <li><strong>Trust:</strong> Building long-term relationships through integrity, transparency, and accountability.</li>
            </ul>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">Company Information</h3>
            <p class="mb-2"><strong>Company Name:</strong> GOFTORA TRADING PRIVATE LIMITED</p>
            <p class="mb-2"><strong>Registered Address:</strong></p>
            <p class="mb-2 pl-4">
              PLOT NO E-260 B-A, Balongi, Rupnagar<br />
              SECTOR-74, PH-8B, INDL AREA<br />
              Mohali District: SAS Nagar State: Punjab 160055<br />
              India
            </p>
            <p class="mb-2"><strong>Email:</strong> <a href="mailto:" class="text-primary-600 hover:underline"></a></p>
            <p class="mb-2"><strong>Mobile:</strong> <a href="tel:" class="text-primary-600 hover:underline"></a></p>
          </div>
        </div>
      `,
    },
    contact: {
      title: 'Contact Us',
      content: `
        <div class="space-y-6">
          <p class="mb-4">We'd love to hear from you! Get in touch with us through any of the following channels:</p>
          
          <div>
            <h3 class="text-xl font-semibold mb-3">Email</h3>
            <p><a href="mailto:" class="text-primary-600 hover:underline"></a></p>
          </div>
          
          <div>
            <h3 class="text-xl font-semibold mb-3">Phone / WhatsApp</h3>
            <p><a href="tel:" class="text-primary-600 hover:underline"></a></p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">Address</h3>
            <p><strong>GOFTORA TRADING PRIVATE LIMITED</strong><br />
            PLOT NO E-260 B-A, Balongi, Rupnagar<br />
            SECTOR-74, PH-8B, INDL AREA<br />
            Mohali District: SAS Nagar State: Punjab 160055<br />
            India</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">Business Hours</h3>
            <p>Monday to Saturday: 9:00 AM – 6:00 PM IST</p>
          </div>
        </div>
      `,
    },
    shipping: {
      title: 'Shipping Information',
      content: `
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold mb-4">Shipping Policy</h2>
            <p class="mb-4">At Goftora Trading, we understand the importance of timely delivery. We have partnered with reliable logistics providers to ensure your cosmetics and beauty products reach you safely and on time.</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">Free Shipping</h3>
            <p class="mb-4">We offer <strong>FREE SHIPPING</strong> on all orders above ₹500. For orders below ₹500, a nominal shipping charge may apply based on your location and order weight.</p>
            <p class="mb-4">Free shipping is available to all major cities and towns across India. For remote locations, additional charges may apply, which will be clearly displayed during checkout.</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">Delivery Timeline</h3>
            <ul class="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Standard Delivery:</strong> 3-7 business days for most locations</li>
              <li><strong>Express Delivery:</strong> 1-3 business days (available for select locations at additional charges)</li>
              <li><strong>Metro Cities:</strong> 2-5 business days (Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad, Pune)</li>
              <li><strong>Tier 2 &amp; 3 Cities:</strong> 5-7 business days</li>
              <li><strong>Remote Areas:</strong> 7-10 business days (subject to courier service availability)</li>
            </ul>
            <p class="mb-4"><em>Note: Delivery timelines are estimates and may vary due to factors beyond our control such as weather conditions, natural disasters, or courier service delays.</em></p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">Shipping Methods</h3>
            <p class="mb-4">We use trusted courier partners including:</p>
            <ul class="list-disc pl-6 space-y-2 mb-4">
              <li>Blue Dart</li>
              <li>DTDC</li>
              <li>Delhivery</li>
              <li>India Post</li>
              <li>Other regional courier services</li>
            </ul>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">Order Processing</h3>
            <ul class="list-disc pl-6 space-y-2 mb-4">
              <li>Orders placed before 2:00 PM on business days are processed the same day</li>
              <li>Orders placed after 2:00 PM are processed on the next business day</li>
              <li>Orders placed on weekends or holidays are processed on the next business day</li>
              <li>Once processed, orders are dispatched within 24-48 hours</li>
            </ul>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">Damaged or Lost Shipments</h3>
            <p class="mb-4">In the rare event that your order is damaged during transit or lost:</p>
            <ul class="list-disc pl-6 space-y-2 mb-4">
              <li>Please contact us immediately at <a href="mailto:" class="text-primary-600 hover:underline"></a> or call <a href="tel:" class="text-primary-600 hover:underline"></a></li>
              <li>Provide your order number and photos of the damaged package (if applicable)</li>
              <li>We will investigate and resolve the issue promptly</li>
              <li>You may be eligible for a replacement or full refund as per our refund policy</li>
            </ul>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">Contact for Shipping Queries</h3>
            <p class="mb-2">For any shipping-related queries or concerns, please contact us:</p>
            <p class="mb-2"><strong>Email:</strong> <a href="mailto:" class="text-primary-600 hover:underline"></a></p>
            <p class="mb-2"><strong>Phone:</strong> <a href="tel:" class="text-primary-600 hover:underline"></a></p>
            <p class="mb-4"><strong>Business Hours:</strong> Monday to Saturday, 9:00 AM to 6:00 PM IST</p>
          </div>
        </div>
      `,
    },
    'refund-policy': {
      title: 'Refund Policy',
      content: `
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold mb-4">Return &amp; Refund Policy</h2>
            <p class="mb-4">At Goftora Trading, we want you to be completely satisfied with your purchase. If you are not happy with your order, we offer a hassle-free return and refund process.</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">Return Eligibility</h3>
            <p class="mb-4">You can return products within <strong>7 days</strong> of delivery, provided the following conditions are met:</p>
            <ul class="list-disc pl-6 space-y-2 mb-4">
              <li>The product is unused, unopened, and in its original condition</li>
              <li>Original packaging is intact with all tags, labels, and accessories</li>
              <li>Original invoice or proof of purchase is provided</li>
              <li>The product is not damaged, defective, or tampered with</li>
              <li>Personal care items and consumables cannot be returned for hygiene reasons (unless defective)</li>
            </ul>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">Return Process</h3>
            <p class="mb-4">To initiate a return:</p>
            <ol class="list-decimal pl-6 space-y-2 mb-4">
              <li>Log in to your account and go to "My Orders"</li>
              <li>Select the order you want to return</li>
              <li>Click on "Return" and select the reason for return</li>
              <li>Our team will review your request and send you a Return Authorization (RA) number</li>
              <li>Pack the product securely in its original packaging</li>
              <li>Include the original invoice and RA number</li>
              <li>Alternatively, email us at <a href="mailto:" class="text-primary-600 hover:underline"></a> or call <a href="tel:" class="text-primary-600 hover:underline"></a></li>
            </ol>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">Refund Process</h3>
            <p class="mb-4">Once we receive and inspect your returned product, refunds will be credited within <strong>5-7 business days</strong> after receiving the returned item to your original payment method.</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">Cancellation Policy</h3>
            <ul class="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Before Shipment:</strong> Full refund will be credited within 24-48 hours</li>
              <li><strong>After Shipment:</strong> You can still cancel, but return shipping charges may apply</li>
              <li>To cancel, contact us at <a href="mailto:" class="text-primary-600 hover:underline"></a></li>
            </ul>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">Contact for Returns &amp; Refunds</h3>
            <p class="mb-2"><strong>Email:</strong> <a href="mailto:" class="text-primary-600 hover:underline"></a></p>
            <p class="mb-2"><strong>Phone:</strong> <a href="tel:" class="text-primary-600 hover:underline"></a></p>
            <p class="mb-4"><strong>Business Hours:</strong> Monday to Saturday, 9:00 AM to 6:00 PM IST</p>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="mb-2"><strong>Note:</strong> This refund policy is subject to change without prior notice. By making a purchase on our website, you agree to the terms of this refund policy.</p>
          </div>
        </div>
      `,
    },
    terms: {
      title: 'Terms & Conditions',
      content: `
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold mb-4">Terms and Conditions</h2>
            <p class="mb-4">Welcome to Goftora Trading. These Terms and Conditions ("Terms") govern your use of our website and services. By accessing or using our website, you agree to be bound by these Terms.</p>
            <p class="mb-4"><strong>Last Updated:</strong> May 2025</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">1. Acceptance of Terms</h3>
            <p class="mb-4">By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">2. Company Information</h3>
            <p class="mb-2">This website is operated by:</p>
            <p class="mb-2"><strong>GOFTORA TRADING PRIVATE LIMITED</strong></p>
            <p class="mb-2">
              PLOT NO E-260 B-A, Balongi, Rupnagar<br />
              SECTOR-74, PH-8B, INDL AREA<br />
              Mohali District: SAS Nagar State: Punjab 160055<br />
              India
            </p>
            <p class="mb-2"><strong>Email:</strong> <a href="mailto:" class="text-primary-600 hover:underline"></a></p>
            <p class="mb-2"><strong>Phone:</strong> <a href="tel:" class="text-primary-600 hover:underline"></a></p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">3. Use of Website</h3>
            <p class="mb-4">You agree to use this website only for lawful purposes and in a way that does not infringe the rights of others. Prohibited behavior includes:</p>
            <ul class="list-disc pl-6 space-y-2 mb-4">
              <li>Harassing or causing distress to any person</li>
              <li>Transmitting obscene or offensive content</li>
              <li>Attempting to gain unauthorized access to our website or systems</li>
              <li>Using automated systems or software to extract data from our website</li>
            </ul>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">4. Account Registration</h3>
            <p class="mb-4">To make purchases on our website, you may need to create an account. You agree to provide accurate information, maintain security of your password, and notify us of any unauthorized use.</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">5. Pricing and Payment</h3>
            <p class="mb-4">All prices are displayed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. Prices are subject to change without prior notice. Payment can be made through credit/debit cards, net banking, UPI, wallets, or Cash on Delivery (COD).</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">6. Shipping and Delivery</h3>
            <p class="mb-4">Please refer to our <a href="/shipping" class="text-primary-600 hover:underline">Shipping Information</a> page for detailed shipping policies.</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">7. Returns and Refunds</h3>
            <p class="mb-4">Please refer to our <a href="/refund-policy" class="text-primary-600 hover:underline">Refund Policy</a> for detailed information about returns and refunds.</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">8. Intellectual Property</h3>
            <p class="mb-4">All content on this website, including text, graphics, logos, images, and software, is the property of GOFTORA TRADING PRIVATE LIMITED and is protected by Indian and international copyright laws.</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">9. Governing Law</h3>
            <p class="mb-4">These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Mohali, Punjab, India.</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">10. Contact Information</h3>
            <p class="mb-2">If you have any questions about these Terms, please contact us:</p>
            <p class="mb-2"><strong>Email:</strong> <a href="mailto:" class="text-primary-600 hover:underline"></a></p>
            <p class="mb-2"><strong>Phone:</strong> <a href="tel:" class="text-primary-600 hover:underline"></a></p>
            <p class="mb-4"><strong>Address:</strong> PLOT NO E-260 B-A, Balongi, Rupnagar, SECTOR-74, PH-8B, INDL AREA, Mohali District: SAS Nagar State: Punjab 160055, India</p>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <p><strong>By using our website, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</strong></p>
          </div>
        </div>
      `,
    },
    privacy: {
      title: 'Privacy Policy',
      content: `
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold mb-4">Privacy Policy</h2>
            <p class="mb-4">At GOFTORA TRADING PRIVATE LIMITED ("we," "us," or "our"), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.</p>
            <p class="mb-4"><strong>Last Updated:</strong> May 2025</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">1. Information We Collect</h3>
            <p class="mb-4">We collect information that you provide directly to us when you create an account, make a purchase, contact us, or subscribe to our newsletter. We also automatically collect certain information including device information, usage data, and location based on IP address.</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">2. How We Use Your Information</h3>
            <ul class="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Order Processing:</strong> To process and fulfill your orders and provide customer support</li>
              <li><strong>Account Management:</strong> To create and manage your account</li>
              <li><strong>Communication:</strong> To send updates about your orders and respond to inquiries</li>
              <li><strong>Security:</strong> To detect, prevent, and address fraud and security issues</li>
              <li><strong>Legal Compliance:</strong> To comply with legal obligations</li>
              <li><strong>Personalization:</strong> To personalize your shopping experience</li>
            </ul>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">3. Information Sharing</h3>
            <p class="mb-4">We do not sell your personal information. We may share your information with third-party service providers (payment processors, shipping companies, analytics providers) who are contractually obligated to protect your information.</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">4. Data Security</h3>
            <p class="mb-4">We implement appropriate security measures including SSL encryption, secure servers, access controls, and regular security assessments to protect your personal information.</p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">5. Your Rights</h3>
            <ul class="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Access:</strong> You can request access to your personal information</li>
              <li><strong>Correction:</strong> You can update or correct your information</li>
              <li><strong>Deletion:</strong> You can request deletion of your account and data</li>
              <li><strong>Opt-Out:</strong> You can opt-out of marketing communications</li>
            </ul>
            <p class="mb-4">To exercise these rights, contact us at <a href="mailto:" class="text-primary-600 hover:underline"></a></p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">6. Contact Us</h3>
            <p class="mb-2"><strong>GOFTORA TRADING PRIVATE LIMITED</strong></p>
            <p class="mb-2">
              PLOT NO E-260 B-A, Balongi, Rupnagar<br />
              SECTOR-74, PH-8B, INDL AREA<br />
              Mohali District: SAS Nagar State: Punjab 160055<br />
              India
            </p>
            <p class="mb-2"><strong>Email:</strong> <a href="mailto:" class="text-primary-600 hover:underline"></a></p>
            <p class="mb-2"><strong>Phone:</strong> <a href="tel:" class="text-primary-600 hover:underline"></a></p>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <p><strong>By using our website, you acknowledge that you have read and understood this Privacy Policy and consent to the collection and use of your information as described herein.</strong></p>
          </div>
        </div>
      `,
    },
  };

  const page = content[slug] || {
    title: 'Page Not Found',
    content: '<p>The page you are looking for does not exist.</p>',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Home', link: '/' }, { label: page.title }]} />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{page.title}</h1>
        <div
          className="prose max-w-none bg-white rounded-lg shadow-md p-8"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
};

export default StaticPage;
