'use client';

import { HeadphonesIcon, MessageSquare, Mail, Phone, Clock, Send } from 'lucide-react';
import { useState } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { translations } from '@/translations';

export default function SupportPage() {
  const { locale } = useLocale();
  const t = translations[locale];
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const tickets = [
    { id: 'TKT-001', subject: 'Order delivery issue', status: 'Open', date: '2026-02-14', response: 'Pending' },
    { id: 'TKT-002', subject: 'Product return request', status: 'In Progress', date: '2026-02-13', response: 'Agent assigned' },
    { id: 'TKT-003', subject: 'Payment not reflected', status: 'Resolved', date: '2026-02-10', response: 'Resolved' },
  ];

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t.customerSupport}</h1>
        <p className="text-gray-600">{t.supportDescription}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Options */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Cards */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.contactUs}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{t.phoneContact}</div>
                  <div className="text-sm text-gray-600">+1 (800) 123-4567</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{t.email}</div>
                  <div className="text-sm text-gray-600">support@example.com</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Hours</div>
                  <div className="text-sm text-gray-600">Mon-Fri: 9AM-6PM</div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Quick Links */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Help</h3>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-primary hover:text-primary/80">How to track my order?</a>
              <a href="#" className="block text-sm text-primary hover:text-primary/80">How to return a product?</a>
              <a href="#" className="block text-sm text-primary hover:text-primary/80">Payment methods accepted</a>
              <a href="#" className="block text-sm text-primary hover:text-primary/80">Shipping information</a>
              <a href="#" className="block text-sm text-primary hover:text-primary/80">View all FAQs →</a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* New Ticket Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <HeadphonesIcon className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-gray-900">Submit a Support Ticket</h2>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                  <option>Select a category</option>
                  <option>Order Issue</option>
                  <option>Payment Problem</option>
                  <option>Product Question</option>
                  <option>Shipping Inquiry</option>
                  <option>Return/Refund</option>
                  <option>Technical Support</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="ORD-2024-XXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  placeholder="Please provide detailed information about your issue..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Send className="w-4 h-4" />
                Submit Ticket
              </button>
            </form>
          </div>

          {/* Recent Tickets */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Support Tickets</h3>
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-medium text-gray-900">{ticket.id}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        ticket.status === 'Open' ? 'bg-blue-100 text-blue-700' :
                        ticket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-900 mb-1">{ticket.subject}</div>
                    <div className="text-xs text-gray-500">
                      Created: {ticket.date} • {ticket.response}
                    </div>
                  </div>
                  <button className="text-primary hover:text-primary/80 text-sm font-medium">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
