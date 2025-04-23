'use client';

import React, { useState } from 'react';
import { FiMail, FiPhone, FiMessageSquare, FiHelpCircle, FiFileText, FiPackage, FiCreditCard, FiRefreshCw } from 'react-icons/fi';

const SupportPage = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    orderNumber: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // In a real application, you would send the form data to your backend
    console.log('Form submitted:', contactForm);
    
    // Show success message
    setError('');
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        orderNumber: ''
      });
    }, 3000);
  };

  // FAQ data
  const faqCategories = [
    {
      category: "Orders & Shipping",
      icon: <FiPackage className="mr-2" />,
      questions: [
        {
          question: "How do I track my order?",
          answer: "You can track your order by logging into your account and visiting the 'My Orders' section. Alternatively, you can use the tracking number provided in your shipping confirmation email."
        },
        {
          question: "What are the shipping options?",
          answer: "We offer standard shipping (3-5 business days), express shipping (1-2 business days), and same-day delivery in select areas. Shipping costs vary based on your location and chosen shipping method."
        },
        {
          question: "Can I change or cancel my order?",
          answer: "Orders can be modified or canceled within 1 hour of placing them. After this window, please contact our customer support team for assistance."
        }
      ]
    },
    {
      category: "Returns & Refunds",
      icon: <FiRefreshCw className="mr-2" />,
      questions: [
        {
          question: "What is your return policy?",
          answer: "We offer a 30-day return policy for most products. Items must be in their original condition with all packaging and accessories. Some products may have specific return conditions."
        },
        {
          question: "How do I initiate a return?",
          answer: "To initiate a return, log into your account, go to 'My Orders', select the order containing the item you wish to return, and follow the return instructions. You can also contact our support team for assistance."
        },
        {
          question: "When will I receive my refund?",
          answer: "Once your return is received and inspected, we'll process your refund within 3-5 business days. The time it takes for the refund to appear in your account depends on your payment method and financial institution."
        }
      ]
    },
    {
      category: "Payment & Pricing",
      icon: <FiCreditCard className="mr-2" />,
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept Visa, Mastercard, American Express, PayPal, and Apple Pay. For certain regions, we also offer cash on delivery and bank transfers."
        },
        {
          question: "Is it safe to use my credit card on your website?",
          answer: "Yes, our website uses industry-standard SSL encryption to protect your personal and payment information. We are PCI DSS compliant and never store your full credit card details on our servers."
        },
        {
          question: "Do you price match?",
          answer: "Yes, we offer price matching for identical products sold by authorized retailers. Please contact our customer support with details of the competitor's offer to request a price match."
        }
      ]
    },
    {
      category: "Product Information",
      icon: <FiFileText className="mr-2" />,
      questions: [
        {
          question: "Do your laptops come with a warranty?",
          answer: "Yes, all our laptops come with a manufacturer's warranty. Most laptops include a standard 1-year warranty, while some premium models offer extended warranty options."
        },
        {
          question: "Can I upgrade components after purchase?",
          answer: "This depends on the laptop model. Some laptops allow for RAM and storage upgrades, while others have components that are soldered to the motherboard. Check the product specifications or contact us for specific upgrade options for your desired model."
        },
        {
          question: "Do you sell international versions of laptops?",
          answer: "We primarily sell regional versions of laptops that are intended for our market. These come with appropriate power adapters and keyboard layouts. If you need an international version, please contact us before placing your order."
        }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Customer Support</h1>
        <p className="text-gray-600 dark:text-gray-400">We're here to help with any questions or concerns about your purchase</p>
      </div>
      
      {/* Support Options Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('faq')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'faq'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FiHelpCircle className="mr-2" />
                FAQs
              </div>
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'contact'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FiMessageSquare className="mr-2" />
                Contact Us
              </div>
            </button>
          </nav>
        </div>
      </div>
      
      {/* FAQ Section */}
      {activeTab === 'faq' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {faqCategories.map((category, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                {category.icon}
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.questions.map((faq, faqIndex) => (
                  <details key={faqIndex} className="group">
                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                      <span>{faq.question}</span>
                      <span className="transition group-open:rotate-180">
                        <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24">
                          <path d="M6 9l6 6 6-6"></path>
                        </svg>
                      </span>
                    </summary>
                    <p className="text-gray-600 dark:text-gray-400 mt-3 group-open:animate-fadeIn">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Contact Us Section */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Send Us a Message</h2>
              
              {submitted ? (
                <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 p-4 rounded-md mb-4">
                  <p>Thank you for your message! Our support team will get back to you shortly.</p>
                </div>
              ) : error ? (
                <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded-md mb-4">
                  <p>{error}</p>
                </div>
              ) : null}
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={contactForm.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a subject</option>
                    <option value="order">Order Inquiry</option>
                    <option value="product">Product Information</option>
                    <option value="return">Return/Refund</option>
                    <option value="technical">Technical Support</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Order Number (if applicable)
                  </label>
                  <input
                    type="text"
                    id="orderNumber"
                    name="orderNumber"
                    value={contactForm.orderNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={contactForm.message}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
          
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FiMail className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Email Us</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">support@laptopstore.com</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">sales@laptopstore.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FiPhone className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Call Us</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">+1 (800) 123-4567</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Mon-Fri: 9am-6pm EST</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-600 rounded-lg shadow-md p-6 text-white">
              <h2 className="text-xl font-semibold mb-4">Live Chat Support</h2>
              <p className="mb-4">Get instant help from our support team through live chat.</p>
              <button className="bg-white text-blue-600 hover:bg-gray-100 font-medium py-2 px-6 rounded-md transition-colors w-full flex items-center justify-center">
                <FiMessageSquare className="mr-2" />
                Start Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPage;
