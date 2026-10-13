// ============================================================================
// FILE: frontend/src/views/UpgradeProModalView.jsx
// PURPOSE: Modal view to upgrade to FocusFlow Pro and trigger the CleverTap
// "Charged" special event with Amount, Payment mode, Charged ID, and Items collection.
// ============================================================================

import React, { useState } from 'react';

export default function UpgradeProModalView({
  isOpen,
  onClose,
  onPurchase,
  isProUser
}) {
  const [selectedPlan, setSelectedPlan] = useState('Annual'); // 'Monthly' | 'Annual'
  const [paymentMode, setPaymentMode] = useState('Credit Card');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1 rounded-full text-indigo-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 text-indigo-100">
            CleverTap &quot;Charged&quot; Event
          </span>
          <h2 className="text-2xl font-bold mt-2">Upgrade to FocusFlow Pro</h2>
          <p className="text-xs text-indigo-100 mt-1 leading-relaxed">
            Unlocks unlimited Pomodoro sessions, binaural focus audio, and advanced analytics.
            Recording this purchase fires the canonical <span className="font-mono font-bold">Charged</span> event in CleverTap.
          </p>
        </div>

        {/* Plan Selection Cards */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Annual Plan */}
            <button
              type="button"
              onClick={() => setSelectedPlan('Annual')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                selectedPlan === 'Annual'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="absolute -top-2.5 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                Best Value
              </span>
              <p className="text-xs font-bold text-slate-500 uppercase">Annual Plan</p>
              <p className="text-2xl font-black text-slate-900 mt-1">$29.99</p>
              <p className="text-[11px] text-slate-500 mt-0.5">$2.49/mo · billed yearly</p>
              <div className="mt-3 pt-3 border-t border-slate-200 text-[10px] text-slate-600 font-mono">
                2 Items included (Subscription + Soundtracks)
              </div>
            </button>

            {/* Monthly Plan */}
            <button
              type="button"
              onClick={() => setSelectedPlan('Monthly')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedPlan === 'Monthly'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="text-xs font-bold text-slate-500 uppercase">Monthly Plan</p>
              <p className="text-2xl font-black text-slate-900 mt-1">$9.99</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Flexible monthly billing</p>
              <div className="mt-3 pt-3 border-t border-slate-200 text-[10px] text-slate-600 font-mono">
                1 Item included
              </div>
            </button>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Payment Method (Recorded in Charged Event)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Credit Card', 'Apple Pay', 'PayPal'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    paymentMode === mode
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Charged Event Spec Preview */}
          <div className="p-3.5 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] space-y-1">
            <div className="text-emerald-400 font-bold">// CleverTap Event Payload</div>
            <div>Event: &quot;Charged&quot;</div>
            <div>Amount: {selectedPlan === 'Annual' ? 29.99 : 9.99}</div>
            <div>Payment mode: &quot;{paymentMode}&quot;</div>
            <div>Items: [{selectedPlan === 'Annual' ? '2 items' : '1 item'}]</div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            disabled={isProUser}
            onClick={() => onPurchase(selectedPlan, paymentMode)}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isProUser
              ? 'Already a Pro Member'
              : `Complete Purchase ($${selectedPlan === 'Annual' ? '29.99' : '9.99'})`}
          </button>
        </div>
      </div>
    </div>
  );
}

