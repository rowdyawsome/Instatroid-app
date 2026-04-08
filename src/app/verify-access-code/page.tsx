'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AccessCodePage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);

  const handleVerify = async () => {
    if (accessCode.length !== 12) return;
    setIsLoading(true);
    setIsInvalid(false);

    await new Promise((r) => setTimeout(r, 2000));
    setIsLoading(false);

    // Always invalid — redirect to payment
    setIsInvalid(true);
    setAccessCode('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-neutral-800 rounded-2xl max-w-md w-full border border-neutral-600">
        <div className="px-6 py-4 border-b border-neutral-700">
          <h2 className="text-xl font-bold text-white">Verify Access Code</h2>
          <p className="text-sm mt-1 text-neutral-400">
            Please enter your 12-digit access code to continue
          </p>
        </div>

        <div className="px-6 py-6 space-y-4">
          <div>
            <input
              type="password"
              value={accessCode}
              onChange={(e) => {
                setAccessCode(e.target.value);
                if (isInvalid) setIsInvalid(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && accessCode.length === 12 && handleVerify()}
              placeholder="Enter 12-digit access code"
              maxLength={12}
              autoFocus
              className={`w-full px-4 py-3 border rounded-lg bg-transparent text-white outline-none transition-all ${
                isInvalid
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                  : 'border-neutral-600 focus:ring-2 focus:ring-pink-500 focus:border-pink-500'
              }`}
            />
            <div className="flex justify-between mt-2">
              <span className={`text-xs ${accessCode.length === 12 ? 'text-green-400' : 'text-neutral-400'}`}>
                {accessCode.length}/12 characters
              </span>
              {isInvalid && (
                <span className="text-red-400 text-xs flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Invalid access code
                </span>
              )}
            </div>
          </div>

          {isInvalid && (
            <div className="text-center">
              <Link
                href="/get-access-code"
                className="text-pink-400 hover:text-pink-300 text-sm font-medium underline transition-colors"
              >
                Don&apos;t have an access code? Get one now
              </Link>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => router.push('/')}
              className="flex-1 px-4 py-3 border-2 border-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={accessCode.length !== 12 || isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-600 disabled:bg-neutral-700 disabled:bg-none disabled:text-neutral-400 text-white font-medium rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Verifying...
                </>
              ) : isInvalid ? (
                'Try Again'
              ) : (
                'Verify'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
