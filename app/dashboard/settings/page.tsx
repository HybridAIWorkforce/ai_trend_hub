'use client';

import { useState, useEffect } from 'react';
import { Settings, User, Bell, Database, BookOpen, Video, DollarSign, Plus, Trash2, Save, Loader2, BarChart3, Eye, MousePointer, Copy, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface CTASettings {
  enabled: boolean;
  book: {
    enabled: boolean;
    title: string;
    description: string;
    buyLink: string;
    price: string;
  };
  video: {
    enabled: boolean;
    title: string;
    description: string;
    videoLink: string;
  };
  affiliateProducts: Array<{
    id: string;
    name: string;
    description: string;
    link: string;
    commission: string;
  }>;
  customCTAs: Array<{
    id: string;
    text: string;
    link: string;
    description: string;
  }>;
  placement: 'end' | 'middle' | 'both';
  style: 'invitational' | 'direct' | 'educational';
}

interface CTAAnalytics {
  summary: Record<string, { impressions: number; clicks: number; copies: number }>;
  details: Record<string, { impressions: number; clicks: number; copies: number }>;
  recentEvents: Array<{
    ctaType: string;
    ctaLabel: string;
    eventType: string;
    platform: string;
    createdAt: string;
  }>;
  period: string;
}

function isValidUrl(url: string): boolean {
  if (!url.trim()) return true; // empty is fine (optional)
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default function SettingsPage() {
  const { data: session } = useSession() || {};
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ctaSettings, setCtaSettings] = useState<CTASettings | null>(null);
  const [analytics, setAnalytics] = useState<CTAAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Fetch CTA settings on mount
  useEffect(() => {
    fetchCTASettings();
  }, []);

  const fetchCTASettings = async () => {
    try {
      const response = await fetch('/api/settings/cta');
      if (response.ok) {
        const data = await response.json();
        setCtaSettings(data.ctaSettings);
      }
    } catch (error) {
      console.error('Error fetching CTA settings:', error);
      toast.error('Failed to load CTA settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await fetch('/api/cta-analytics?days=30');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching CTA analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const validateSettings = (): string[] => {
    const errors: string[] = [];
    if (!ctaSettings) return errors;

    if (ctaSettings.book.enabled) {
      if (!ctaSettings.book.title.trim()) errors.push('Book title is required when enabled');
      if (ctaSettings.book.buyLink && !isValidUrl(ctaSettings.book.buyLink)) errors.push('Book link is not a valid URL');
    }
    if (ctaSettings.video.enabled) {
      if (!ctaSettings.video.title.trim()) errors.push('Video title is required when enabled');
      if (ctaSettings.video.videoLink && !isValidUrl(ctaSettings.video.videoLink)) errors.push('Video link is not a valid URL');
    }
    ctaSettings.affiliateProducts.forEach((p, i) => {
      if (p.link && !isValidUrl(p.link)) errors.push(`Affiliate product ${i + 1} link is not a valid URL`);
    });
    ctaSettings.customCTAs.forEach((c, i) => {
      if (c.link && !isValidUrl(c.link)) errors.push(`Custom CTA ${i + 1} link is not a valid URL`);
    });
    return errors;
  };

  const saveCTASettings = async () => {
    const errors = validateSettings();
    if (errors.length > 0) {
      errors.forEach(e => toast.error(e));
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/settings/cta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ctaSettings })
      });

      if (response.ok) {
        toast.success('CTA settings saved successfully!');
      } else {
        toast.error('Failed to save CTA settings');
      }
    } catch (error) {
      console.error('Error saving CTA settings:', error);
      toast.error('Failed to save CTA settings');
    } finally {
      setSaving(false);
    }
  };

  const addAffiliateProduct = () => {
    if (!ctaSettings) return;
    setCtaSettings({
      ...ctaSettings,
      affiliateProducts: [
        ...ctaSettings.affiliateProducts,
        {
          id: Date.now().toString(),
          name: '',
          description: '',
          link: '',
          commission: ''
        }
      ]
    });
  };

  const removeAffiliateProduct = (id: string) => {
    if (!ctaSettings) return;
    setCtaSettings({
      ...ctaSettings,
      affiliateProducts: ctaSettings.affiliateProducts.filter(p => p.id !== id)
    });
  };

  const addCustomCTA = () => {
    if (!ctaSettings) return;
    setCtaSettings({
      ...ctaSettings,
      customCTAs: [
        ...ctaSettings.customCTAs,
        {
          id: Date.now().toString(),
          text: '',
          link: '',
          description: ''
        }
      ]
    });
  };

  const removeCustomCTA = (id: string) => {
    if (!ctaSettings) return;
    setCtaSettings({
      ...ctaSettings,
      customCTAs: ctaSettings.customCTAs.filter(c => c.id !== id)
    });
  };

  if (loading || !ctaSettings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-400" />
          Settings
        </h1>
        <p className="text-zinc-400">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 border border-zinc-800/50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Profile Information</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Name</label>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white">
              {session?.user?.name ?? 'N/A'}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white">
              {session?.user?.email ?? 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Data Refresh Settings */}
      <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 border border-zinc-800/50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Data Refresh</h2>
        </div>
        
        <p className="text-zinc-400 mb-4">
          The system automatically refreshes RSS feeds and Reddit data every 30 minutes to keep your dashboard up-to-date.
        </p>
        
        <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Auto Refresh Interval</p>
              <p className="text-sm text-zinc-500">Every 30 minutes</p>
            </div>
            <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm font-medium">
              Active
            </div>
          </div>
        </div>
      </div>

      {/* CTA Settings - NEW */}
      <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 border border-zinc-800/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Call-to-Action Settings</h2>
          </div>
          <button
            onClick={saveCTASettings}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4" /> Save CTAs</>
            )}
          </button>
        </div>

        <p className="text-zinc-400 mb-6">
          Add calls-to-action to your generated articles. Promote your book, videos, affiliate products, or custom links.
        </p>

        {/* Master CTA Toggle */}
        <div className="mb-6 p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={ctaSettings.enabled}
              onChange={(e) => setCtaSettings({ ...ctaSettings, enabled: e.target.checked })}
              className="w-5 h-5 rounded border-zinc-600 bg-zinc-700 text-blue-500 focus:ring-blue-500"
            />
            <div>
              <p className="text-white font-medium">Enable CTAs in Articles</p>
              <p className="text-sm text-zinc-500">Add CTAs to all generated articles</p>
            </div>
          </label>
        </div>

        {ctaSettings.enabled && (
          <div className="space-y-6">
            {/* Book CTA */}
            <div className="border border-zinc-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Book Promotion</h3>
                <label className="ml-auto flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ctaSettings.book.enabled}
                    onChange={(e) => setCtaSettings({
                      ...ctaSettings,
                      book: { ...ctaSettings.book, enabled: e.target.checked }
                    })}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-green-500"
                  />
                  <span className="text-sm text-zinc-400">Enabled</span>
                </label>
              </div>

              {ctaSettings.book.enabled && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Book Title</label>
                    <input
                      type="text"
                      value={ctaSettings.book.title}
                      onChange={(e) => setCtaSettings({
                        ...ctaSettings,
                        book: { ...ctaSettings.book, title: e.target.value }
                      })}
                      placeholder="e.g., Reshaping Recruitment"
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Description</label>
                    <textarea
                      value={ctaSettings.book.description}
                      onChange={(e) => setCtaSettings({
                        ...ctaSettings,
                        book: { ...ctaSettings.book, description: e.target.value }
                      })}
                      placeholder="e.g., Learn how I built a Hybrid AI Workforce that transformed my business..."
                      rows={3}
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Buy Link (Amazon, etc.)</label>
                      <input
                        type="url"
                        value={ctaSettings.book.buyLink}
                        onChange={(e) => setCtaSettings({
                          ...ctaSettings,
                          book: { ...ctaSettings.book, buyLink: e.target.value }
                        })}
                        placeholder="https://amazon.com/..."
                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Price (Optional)</label>
                      <input
                        type="text"
                        value={ctaSettings.book.price}
                        onChange={(e) => setCtaSettings({
                          ...ctaSettings,
                          book: { ...ctaSettings.book, price: e.target.value }
                        })}
                        placeholder="$29.99"
                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Video CTA */}
            <div className="border border-zinc-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <Video className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Video/Course Promotion</h3>
                <label className="ml-auto flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ctaSettings.video.enabled}
                    onChange={(e) => setCtaSettings({
                      ...ctaSettings,
                      video: { ...ctaSettings.video, enabled: e.target.checked }
                    })}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-purple-500"
                  />
                  <span className="text-sm text-zinc-400">Enabled</span>
                </label>
              </div>

              {ctaSettings.video.enabled && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Video/Course Title</label>
                    <input
                      type="text"
                      value={ctaSettings.video.title}
                      onChange={(e) => setCtaSettings({
                        ...ctaSettings,
                        video: { ...ctaSettings.video, title: e.target.value }
                      })}
                      placeholder="e.g., Master the Hybrid AI Workforce"
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Description</label>
                    <textarea
                      value={ctaSettings.video.description}
                      onChange={(e) => setCtaSettings({
                        ...ctaSettings,
                        video: { ...ctaSettings.video, description: e.target.value }
                      })}
                      placeholder="e.g., Watch my free masterclass on building AI systems that scale..."
                      rows={3}
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Video Link (YouTube, Vimeo, etc.)</label>
                    <input
                      type="url"
                      value={ctaSettings.video.videoLink}
                      onChange={(e) => setCtaSettings({
                        ...ctaSettings,
                        video: { ...ctaSettings.video, videoLink: e.target.value }
                      })}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Affiliate Products */}
            <div className="border border-zinc-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Affiliate Products</h3>
                </div>
                <button
                  onClick={addAffiliateProduct}
                  className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              {ctaSettings.affiliateProducts.length === 0 ? (
                <p className="text-zinc-500 text-sm">No affiliate products added yet. Click "Add Product" to start.</p>
              ) : (
                <div className="space-y-4">
                  {ctaSettings.affiliateProducts.map((product, index) => (
                    <div key={product.id} className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white font-medium">Product {index + 1}</span>
                        <button
                          onClick={() => removeAffiliateProduct(product.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1">Product Name</label>
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) => {
                              const updated = [...ctaSettings.affiliateProducts];
                              updated[index] = { ...product, name: e.target.value };
                              setCtaSettings({ ...ctaSettings, affiliateProducts: updated });
                            }}
                            placeholder="e.g., AI Tools Bundle"
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1">Description</label>
                          <textarea
                            value={product.description}
                            onChange={(e) => {
                              const updated = [...ctaSettings.affiliateProducts];
                              updated[index] = { ...product, description: e.target.value };
                              setCtaSettings({ ...ctaSettings, affiliateProducts: updated });
                            }}
                            placeholder="e.g., The tools I use every day to run my business..."
                            rows={2}
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm text-zinc-400 mb-1">Affiliate Link</label>
                            <input
                              type="url"
                              value={product.link}
                              onChange={(e) => {
                                const updated = [...ctaSettings.affiliateProducts];
                                updated[index] = { ...product, link: e.target.value };
                                setCtaSettings({ ...ctaSettings, affiliateProducts: updated });
                              }}
                              placeholder="https://..."
                              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-zinc-400 mb-1">Commission Note</label>
                            <input
                              type="text"
                              value={product.commission}
                              onChange={(e) => {
                                const updated = [...ctaSettings.affiliateProducts];
                                updated[index] = { ...product, commission: e.target.value };
                                setCtaSettings({ ...ctaSettings, affiliateProducts: updated });
                              }}
                              placeholder="e.g., I earn a small commission"
                              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom CTAs */}
            <div className="border border-zinc-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-semibold text-white">Custom CTAs</h3>
                </div>
                <button
                  onClick={addCustomCTA}
                  className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Custom CTA
                </button>
              </div>

              {ctaSettings.customCTAs.length === 0 ? (
                <p className="text-zinc-500 text-sm">No custom CTAs added yet. Use these for consulting links, newsletter signups, or any other call-to-action.</p>
              ) : (
                <div className="space-y-4">
                  {ctaSettings.customCTAs.map((cta, index) => (
                    <div key={cta.id} className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white font-medium">Custom CTA {index + 1}</span>
                        <button
                          onClick={() => removeCustomCTA(cta.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1">CTA Text / Label</label>
                          <input
                            type="text"
                            value={cta.text}
                            onChange={(e) => {
                              const updated = [...ctaSettings.customCTAs];
                              updated[index] = { ...cta, text: e.target.value };
                              setCtaSettings({ ...ctaSettings, customCTAs: updated });
                            }}
                            placeholder="e.g., Book a Free Strategy Call"
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1">Description (how to present it)</label>
                          <textarea
                            value={cta.description}
                            onChange={(e) => {
                              const updated = [...ctaSettings.customCTAs];
                              updated[index] = { ...cta, description: e.target.value };
                              setCtaSettings({ ...ctaSettings, customCTAs: updated });
                            }}
                            placeholder="e.g., Let me help you build your own Hybrid AI Workforce..."
                            rows={2}
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1">Link</label>
                          <input
                            type="url"
                            value={cta.link}
                            onChange={(e) => {
                              const updated = [...ctaSettings.customCTAs];
                              updated[index] = { ...cta, link: e.target.value };
                              setCtaSettings({ ...ctaSettings, customCTAs: updated });
                            }}
                            placeholder="https://..."
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTA Style & Placement */}
            <div className="border border-zinc-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">CTA Style & Placement</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">CTA Style (Tone)</label>
                  <select
                    value={ctaSettings.style}
                    onChange={(e) => setCtaSettings({
                      ...ctaSettings,
                      style: e.target.value as 'invitational' | 'direct' | 'educational'
                    })}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="invitational">Invitational (Recommended) - Friendly, not pushy</option>
                    <option value="direct">Direct - Clear action-oriented language</option>
                    <option value="educational">Educational - Learn more, explore further</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Placement in Articles</label>
                  <select
                    value={ctaSettings.placement}
                    onChange={(e) => setCtaSettings({
                      ...ctaSettings,
                      placement: e.target.value as 'end' | 'middle' | 'both'
                    })}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="end">End of Article (Recommended)</option>
                    <option value="middle">Middle of Article</option>
                    <option value="both">Both Middle & End</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CTA Analytics */}
            <div className="border border-zinc-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">CTA Performance</h3>
                </div>
                <button
                  onClick={() => {
                    setShowAnalytics(!showAnalytics);
                    if (!analytics && !analyticsLoading) fetchAnalytics();
                  }}
                  className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  {showAnalytics ? 'Hide Analytics' : 'View Analytics'}
                </button>
              </div>

              {showAnalytics && (
                <div className="space-y-4">
                  {analyticsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                    </div>
                  ) : analytics ? (
                    <>
                      {/* Summary Cards */}
                      <div className="grid grid-cols-3 gap-3">
                        {Object.entries(analytics.summary).length > 0 ? (
                          Object.entries(analytics.summary).map(([type, data]) => (
                            <div key={type} className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3">
                              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">{type}</p>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Eye className="w-3 h-3 text-zinc-500" />
                                  <span className="text-sm text-zinc-300">{data.impressions} views</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MousePointer className="w-3 h-3 text-cyan-400" />
                                  <span className="text-sm text-cyan-400">{data.clicks} clicks</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Copy className="w-3 h-3 text-zinc-500" />
                                  <span className="text-sm text-zinc-300">{data.copies} copies</span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-3 text-center py-6">
                            <p className="text-sm text-zinc-500">No CTA events tracked yet. Analytics will appear as articles are generated and CTAs are used.</p>
                          </div>
                        )}
                      </div>

                      {/* Recent Activity */}
                      {analytics.recentEvents.length > 0 && (
                        <div>
                          <p className="text-sm text-zinc-400 mb-2">Recent Activity</p>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {analytics.recentEvents.slice(0, 10).map((evt, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs py-1 border-b border-zinc-800/50">
                                <span className={`px-1.5 py-0.5 rounded ${
                                  evt.eventType === 'click' ? 'bg-cyan-500/20 text-cyan-400' :
                                  evt.eventType === 'copy' ? 'bg-green-500/20 text-green-400' :
                                  'bg-zinc-700 text-zinc-400'
                                }`}>{evt.eventType}</span>
                                <span className="text-zinc-300 truncate flex-1">{evt.ctaLabel}</span>
                                <span className="text-zinc-600">{new Date(evt.createdAt).toLocaleDateString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-zinc-500 text-center py-4">No analytics data available yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* CTA Preview */}
            <div className="border border-zinc-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <ExternalLink className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-semibold text-white">Active CTA Preview</h3>
              </div>
              <div className="space-y-2">
                {ctaSettings.book.enabled && ctaSettings.book.title && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-zinc-300">📚 {ctaSettings.book.title}</span>
                    {ctaSettings.book.buyLink && !isValidUrl(ctaSettings.book.buyLink) && (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                )}
                {ctaSettings.video.enabled && ctaSettings.video.title && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-zinc-300">🎥 {ctaSettings.video.title}</span>
                    {ctaSettings.video.videoLink && !isValidUrl(ctaSettings.video.videoLink) && (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                )}
                {ctaSettings.affiliateProducts.filter(p => p.name).map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-zinc-300">💼 {p.name}</span>
                    {p.link && !isValidUrl(p.link) && (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                ))}
                {ctaSettings.customCTAs.filter(c => c.text).map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-zinc-300">🔗 {c.text}</span>
                    {c.link && !isValidUrl(c.link) && (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                ))}
                {!ctaSettings.book.enabled && !ctaSettings.video.enabled && ctaSettings.affiliateProducts.length === 0 && ctaSettings.customCTAs.length === 0 && (
                  <p className="text-sm text-zinc-500">No active CTAs. Enable a section above to add CTAs to your articles.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
