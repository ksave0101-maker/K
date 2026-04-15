'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { Plus, X, AlertCircle, CheckCircle } from 'lucide-react';

interface Ticket {
  no: number;
  ticketId: string;
  ticket_id?: string;
  subject: string;
  type: string;
  priority: string;
  status: string;
  created: string;
  created_at?: string;
  lastUpdate: string;
  updated_at?: string;
  age: string;
  description?: string;
}

export default function SupportTicketsPage() {
  const { t } = useLocale();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [tableSearchText, setTableSearchText] = useState('');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // New ticket form
  const [newTicket, setNewTicket] = useState({
    subject: '',
    type: 'General Support',
    priority: 'Normal',
    description: ''
  });

  // Fetch tickets from API
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const userStr = localStorage.getItem('user');
      const userId = userStr ? JSON.parse(userStr)?.userId : null;

      if (!userId) {
        setError('Please login to view your tickets');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        userId: userId.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchText && { search: searchText })
      });

      const response = await fetch(`/api/kenergy/support-tickets?${params}`);
      const data = await response.json();

      if (data.success) {
        setTickets(data.tickets || []);
      } else {
        setError(data.error || 'Failed to fetch tickets');
      }
    } catch (err: unknown) {
      console.error('Fetch tickets error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchText, statusFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  async function handleCreateTicket() {
    if (!newTicket.subject || !newTicket.type) {
      setSubmitStatus({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const userStr = localStorage.getItem('user');
      const userId = userStr ? JSON.parse(userStr)?.userId : null;

      if (!userId) {
        setSubmitStatus({ type: 'error', message: 'Please login to create a ticket' });
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/kenergy/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subject: newTicket.subject,
          type: newTicket.type,
          priority: newTicket.priority,
          description: newTicket.description
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus({ type: 'success', message: `Ticket ${data.ticketId} created successfully!` });
        setTimeout(() => {
          setShowNewTicketModal(false);
          setNewTicket({ subject: '', type: 'General Support', priority: 'Normal', description: '' });
          setSubmitStatus(null);
          fetchTickets(); // Refresh the list
        }, 2000);
      } else {
        setSubmitStatus({ type: 'error', message: data.error || 'Failed to create ticket' });
      }
    } catch (err: unknown) {
      console.error('Create ticket error:', err);
      setSubmitStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  function formatDateTime(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Filter tickets by table search
  const filteredTickets = tickets.filter(ticket =>
    ticket.subject?.toLowerCase().includes(tableSearchText.toLowerCase()) ||
    ticket.ticketId?.toLowerCase().includes(tableSearchText.toLowerCase()) ||
    ticket.ticket_id?.toLowerCase().includes(tableSearchText.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          {t('supportTickets')}
        </h1>
        <button
          onClick={() => setShowNewTicketModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('newTicket')}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors appearance-none pr-10"
            >
              <option value="all">{t('allStatus')}</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={t('searchTickets')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Search Button */}
          <button
            onClick={fetchTickets}
            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium transition-colors"
          >
            {t('search')}
          </button>

          {/* Clear Button */}
          <button
            onClick={() => {
              setSearchText('');
              setStatusFilter('all');
            }}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors"
          >
            {t('clear')}
          </button>
        </div>
      </div>

      {/* My Tickets */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {t('myTickets')}
          </h2>
        </div>

        <div className="p-6">
          {/* Entries selector and search */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <select
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{t('search')}:</span>
              <input
                type="text"
                value={tableSearchText}
                onChange={(e) => setTableSearchText(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent w-48"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-gray-600">Loading tickets...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchTickets}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Retry
                </button>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No tickets found
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t('no')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t('ticketId')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t('subject')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t('type')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t('priority')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t('status')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t('created')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t('lastUpdate')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t('age')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket, index) => (
                    <tr key={ticket.ticket_id || ticket.ticketId} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          {ticket.ticket_id || ticket.ticketId}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {ticket.subject}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded text-sm font-medium">
                          {ticket.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 border rounded text-sm font-medium ${
                          ticket.priority === 'High'
                            ? 'bg-red-100 text-red-700 border-red-300'
                            : ticket.priority === 'Low'
                            ? 'bg-gray-100 text-gray-700 border-gray-300'
                            : 'bg-blue-100 text-blue-700 border-blue-300'
                        }`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded text-sm font-medium ${
                          ticket.status === 'Closed'
                            ? 'bg-gray-500 text-white'
                            : ticket.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                            : 'bg-green-100 text-green-700 border border-green-300'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDateTime(ticket.created_at || ticket.created)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDateTime(ticket.updated_at || ticket.lastUpdate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {ticket.age}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              {t('showing')} {filteredTickets.length > 0 ? 1 : 0} {t('to')} {filteredTickets.length} {t('of')} {filteredTickets.length} {t('entries')}
            </div>
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {t('newTicket') || 'Create New Ticket'}
              </h2>
              <button
                onClick={() => setShowNewTicketModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('subject')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder={t('enterSubject') || 'Enter ticket subject'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('type')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={newTicket.type}
                  onChange={(e) => setNewTicket({ ...newTicket, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="General Support">General Support</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Request Quotation">Request Quotation</option>
                  <option value="Billing Question">Billing Question</option>
                  <option value="Feature Request">Feature Request</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('priority')}
                </label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('description')}
                </label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder={t('provideDetails') || 'Provide additional details...'}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Status Message */}
            {submitStatus && (
              <div className={`mx-6 mb-4 p-4 rounded-md ${submitStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <div className="flex items-center gap-2">
                  {submitStatus.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">{submitStatus.message}</span>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowNewTicketModal(false)}
                disabled={isSubmitting}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleCreateTicket}
                disabled={!newTicket.subject || !newTicket.type || isSubmitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (t('creating') || 'Creating...') : (t('createTicket') || 'Create Ticket')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
