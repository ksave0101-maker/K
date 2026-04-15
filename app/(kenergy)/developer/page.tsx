'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { useSite } from '@/lib/SiteContext';
import { Key, BookOpen, Database, Activity, Copy, Trash2, Eye, EyeOff, X, CheckCircle, AlertCircle } from 'lucide-react';

interface APIKey {
  id: number;
  key_name: string;
  api_key: string;
  api_secret?: string;
  status: string;
  is_active?: boolean;
  expiresAt?: string;
  expires_at?: string;
  lastUsed?: string;
  last_used_at?: string;
  created_at?: string;
}

export default function DeveloperPage() {
  const { t } = useLocale();
  const { selectedSite } = useSite();
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // MQTT Settings
  const [mqttSettings, setMqttSettings] = useState({
    host: 'broker.example.com',
    port: '1883',
    username: '',
    password: '••••••',
    topic: '',
    interval: '30'
  });

  // API Keys
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyData, setNewKeyData] = useState<{apiKey: string, apiSecret: string} | null>(null);
  const [isCreatingKey, setIsCreatingKey] = useState(false);

  // Fetch data on mount
  const fetchMQTTSettings = useCallback(async () => {
    try {
      const userStr = localStorage.getItem('user');
      const userId = userStr ? JSON.parse(userStr)?.userId : null;

      if (!userId) return;

      const response = await fetch(`/api/kenergy/mqtt-settings?userId=${userId}&site=${selectedSite}`);
      const data = await response.json();

      if (data.success && data.settings) {
        setMqttSettings({
          host: data.settings.host || 'broker.example.com',
          port: String(data.settings.port || 1883),
          username: data.settings.username || '',
          password: data.settings.password || '••••••',
          topic: data.settings.topic || '',
          interval: String(data.settings.interval || 30)
        });
      }
    } catch (err: unknown) {
      console.error('Fetch MQTT settings error:', err);
    }
  }, [selectedSite]);

  const fetchAPIKeys = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const userStr = localStorage.getItem('user');
      const userId = userStr ? JSON.parse(userStr)?.userId : null;

      if (!userId) {
        setError('Please login to view API keys');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/kenergy/api-keys?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setApiKeys(data.keys || []);
      } else {
        setError(data.error || 'Failed to fetch API keys');
      }
    } catch (err: unknown) {
      console.error('Fetch API keys error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMQTTSettings();
    fetchAPIKeys();
  }, [fetchMQTTSettings, fetchAPIKeys]);

  async function handleSaveMQTT() {
    setIsSaving(true);
    setSubmitStatus(null);

    try {
      const userStr = localStorage.getItem('user');
      const userId = userStr ? JSON.parse(userStr)?.userId : null;

      if (!userId) {
        setSubmitStatus({ type: 'error', message: 'Please login to save settings' });
        setIsSaving(false);
        return;
      }

      const response = await fetch('/api/kenergy/mqtt-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          site: selectedSite,
          host: mqttSettings.host,
          port: parseInt(mqttSettings.port),
          username: mqttSettings.username,
          password: mqttSettings.password !== '••••••' ? mqttSettings.password : undefined,
          topic: mqttSettings.topic,
          interval: parseInt(mqttSettings.interval)
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus({ type: 'success', message: 'MQTT settings saved successfully!' });
        setIsEditing(false);
        setTimeout(() => setSubmitStatus(null), 3000);
      } else {
        setSubmitStatus({ type: 'error', message: data.error || 'Failed to save settings' });
      }
    } catch (err: unknown) {
      console.error('Save MQTT settings error:', err);
      setSubmitStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateAPIKey() {
    if (!newKeyName.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please enter a key name' });
      return;
    }

    setIsCreatingKey(true);
    setSubmitStatus(null);

    try {
      const userStr = localStorage.getItem('user');
      const userId = userStr ? JSON.parse(userStr)?.userId : null;

      if (!userId) {
        setSubmitStatus({ type: 'error', message: 'Please login to create API key' });
        setIsCreatingKey(false);
        return;
      }

      const response = await fetch('/api/kenergy/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          keyName: newKeyName
        })
      });

      const data = await response.json();

      if (data.success) {
        setNewKeyData({
          apiKey: data.apiKey,
          apiSecret: data.apiSecret
        });
        setNewKeyName('');
        fetchAPIKeys(); // Refresh list
      } else {
        setSubmitStatus({ type: 'error', message: data.error || 'Failed to create API key' });
      }
    } catch (err: unknown) {
      console.error('Create API key error:', err);
      setSubmitStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsCreatingKey(false);
    }
  }

  async function handleDeleteAPIKey(keyId: number) {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    try {
      const response = await fetch(`/api/kenergy/api-keys?keyId=${keyId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        fetchAPIKeys(); // Refresh list
      } else {
        alert(data.error || 'Failed to delete API key');
      }
    } catch (err: unknown) {
      console.error('Delete API key error:', err);
      alert('Network error. Please try again.');
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* My API Keys Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-800">
                {t('myAPIKeys')}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
              >
                <BookOpen className="w-4 h-4" />
                {t('apiDocs')}
              </a>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-6">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-gray-600">Loading API keys...</p>
            </div>
          ) : error ? (
            <div>
              <p className="text-red-500 text-sm mb-4">{error}</p>
              <button
                onClick={() => setShowNewKeyModal(true)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium transition-colors flex items-center gap-2"
              >
                <span className="text-xl">+</span>
                {t('newAPIKey')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.length === 0 ? (
                <p className="text-gray-500 text-sm mb-4">
                  No API keys created yet
                </p>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{key.key_name}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            key.is_active || key.status === 'Active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {key.status || (key.is_active ? 'Active' : 'Inactive')}
                          </span>
                          <button
                            onClick={() => handleDeleteAPIKey(key.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete API key"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded p-2 mb-2">
                        <code className="text-xs font-mono text-gray-800 break-all">{key.api_key}</code>
                      </div>
                      <div className="text-xs text-gray-500">
                        <span>Last used: {key.lastUsed || key.last_used_at || 'Never'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowNewKeyModal(true)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium transition-colors flex items-center gap-2"
              >
                <span className="text-xl">+</span>
                {t('newAPIKey')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Device Data Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              {t('deviceData')}
            </h2>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-500 text-sm">
            {t('deviceDataDescription')}
          </p>
        </div>
      </div>

      {/* MQTT Settings Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-semibold text-gray-800">
                {t('mqttSettings')}
              </h2>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-sm flex items-center gap-1"
            >
              ✏️ {t('edit')}
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* MQTT Host */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('mqttHost')}
              </label>
              <input
                type="text"
                value={mqttSettings.host}
                disabled={!isEditing}
                onChange={(e) => setMqttSettings({...mqttSettings, host: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>

            {/* Port */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('port')}
              </label>
              <input
                type="text"
                value={mqttSettings.port}
                disabled={!isEditing}
                onChange={(e) => setMqttSettings({...mqttSettings, port: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>

            {/* Interval */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('interval')} (sec ≥ 30)
              </label>
              <input
                type="text"
                value={mqttSettings.interval}
                disabled={!isEditing}
                onChange={(e) => setMqttSettings({...mqttSettings, interval: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('username')}
              </label>
              <input
                type="text"
                value={mqttSettings.username}
                disabled={!isEditing}
                onChange={(e) => setMqttSettings({...mqttSettings, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                placeholder=""
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={mqttSettings.password}
                  disabled={!isEditing}
                  onChange={(e) => setMqttSettings({...mqttSettings, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('passwordHiddenNote')}
              </p>
            </div>
          </div>

          <div className="mb-6">
            {/* Topic */}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('topic')}
            </label>
            <input
              type="text"
              value={mqttSettings.topic}
              disabled={!isEditing}
              onChange={(e) => setMqttSettings({...mqttSettings, topic: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              placeholder=""
            />
          </div>

          {/* Status Message */}
          {submitStatus && (
            <div className={`mb-4 p-4 rounded-md ${submitStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
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

          {isEditing && (
            <div className="flex gap-3">
              <button
                onClick={handleSaveMQTT}
                disabled={isSaving}
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSaving ? (t('saving') || 'Saving...') : t('save')}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSubmitStatus(null);
                }}
                disabled={isSaving}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                {t('cancel')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New API Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {newKeyData ? (t('apiKeyCreated') || 'API Key Created!') : (t('newAPIKey') || 'Create New API Key')}
              </h2>
              <button
                onClick={() => {
                  setShowNewKeyModal(false);
                  setNewKeyData(null);
                  setNewKeyName('');
                  setSubmitStatus(null);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {newKeyData ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-sm text-yellow-800 font-medium">
                      ⚠️ {t('saveSecretWarning') || 'Please save your API secret now. You will not be able to see it again!'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <div className="bg-gray-50 rounded p-3 flex items-center justify-between">
                      <code className="text-sm font-mono text-gray-800 break-all flex-1">
                        {newKeyData.apiKey}
                      </code>
                      <button
                        onClick={() => navigator.clipboard.writeText(newKeyData.apiKey)}
                        className="ml-2 p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Secret
                    </label>
                    <div className="bg-red-50 border-2 border-red-300 rounded p-3 flex items-center justify-between">
                      <code className="text-sm font-mono text-gray-800 break-all flex-1">
                        {newKeyData.apiSecret}
                      </code>
                      <button
                        onClick={() => navigator.clipboard.writeText(newKeyData.apiSecret)}
                        className="ml-2 p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('keyName') || 'Key Name'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder={t('enterKeyName') || 'e.g., Production API Key'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {submitStatus && (
                    <div className={`p-4 rounded-md ${submitStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
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
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              {newKeyData ? (
                <button
                  onClick={() => {
                    setShowNewKeyModal(false);
                    setNewKeyData(null);
                    setNewKeyName('');
                    setSubmitStatus(null);
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
                >
                  {t('done') || 'Done'}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowNewKeyModal(false);
                      setNewKeyName('');
                      setSubmitStatus(null);
                    }}
                    disabled={isCreatingKey}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors disabled:opacity-50"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleCreateAPIKey}
                    disabled={!newKeyName.trim() || isCreatingKey}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isCreatingKey ? (t('creating') || 'Creating...') : (t('createKey') || 'Create Key')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
