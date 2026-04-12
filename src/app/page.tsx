'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight, Lock, MessageCircleMore, UserCog, UsersIcon, X, AlertCircle,
} from 'lucide-react';

interface UserData {
  username: string;
  displayName: string;
  avatarUrl: string;
  avatarValid: boolean;
}

const features = [
  {
    id: 'score',
    icon: <UserCog className="text-neutral-400" size={24} />,
    title: 'Reveal Profile Password',
    description: 'Extract the account password of any Instagram user',
    modalTitle: 'Reveal Profile Password',
    modalDescription: 'We will extract and decrypt the account password for this Instagram profile',
  },
  {
    id: 'friends',
    icon: <UsersIcon className="text-neutral-400" size={24} />,
    title: 'Reveal Followers & Following',
    description: 'See the full followers and following list of any private account',
    modalTitle: 'Reveal Followers & Following',
    modalDescription: 'Access the complete followers and following list even for private accounts',
  },
  {
    id: 'eyes',
    icon: <Lock className="text-neutral-400" size={24} />,
    title: 'Reveal Private Account Posts',
    description: 'View all posts and stories from any private Instagram account',
    modalTitle: 'Reveal Private Account Posts',
    modalDescription: 'Bypass privacy settings and access all posts, reels and stories from this account',
  },
  {
    id: 'chat',
    icon: <MessageCircleMore className="text-neutral-400" size={24} />,
    title: 'Reveal DM History',
    description: 'Read the full DM inbox of any Instagram user',
    modalTitle: 'Reveal DM History',
    modalDescription: 'Access the complete direct message history including deleted messages from this account',
  },
];

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState('');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [revealProgress, setRevealProgress] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [avatarError, setAvatarError] = useState(false);

  const validateUsername = (input: string) =>
    input.length >= 1 && input.length <= 30 && /^[a-zA-Z0-9_.]+$/.test(input);

  const getValidationMessage = () => {
    if (!username) return null;
    if (username.length > 30) return 'Username must be 30 characters or less';
    if (!/^[a-zA-Z0-9_.]+$/.test(username))
      return 'Username can only contain letters, numbers, underscores, and periods';
    return null;
  };

const fetchInstagramData = async () => {
    setLoading(true);
    setError('');
    setAvatarError(false);

    try {
      if (!username) throw new Error('Username required');

      const res = await fetch(`/api/avatar?username=${username}`);

      if (!res.ok) {
        setAvatarError(true);
        throw new Error('Unable to fetch Instagram profile!');
      }

      const avatarUrl = `/api/avatar?username=${username}`;

      setUserData({
        username,
        displayName: username
          .split(/[._0-9]/g)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
        avatarUrl,
        avatarValid: true,
      });

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not fetch Instagram profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setUserData(null);
    setUsername('');
    setShowValidation(false);
    setError('');
    setActiveModal(null);
    setAvatarError(false);
  };

  const handleFeatureClick = (featureId: string) => {
    if (!userData?.avatarValid) return;
    setActiveModal(featureId);
  };

  const closeModal = () => {
    setActiveModal(null);
    setIsRevealing(false);
    setRevealProgress(0);
    setCurrentStep('');
  };

  const startRevealProcess = () => {
    if (!userData?.avatarValid) return;
    setIsRevealing(true);
    setRevealProgress(0);
    setCurrentStep('Initializing connection...');
  };

  useEffect(() => {
    if (!isRevealing) return;

    const steps = [
      { progress: 25, text: 'Bypassing 2FA authentication...' },
      { progress: 50, text: 'Establishing secure connection...' },
      { progress: 75, text: 'Extracting encrypted data...' },
      { progress: 100, text: 'Finalizing data retrieval...' },
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setRevealProgress(steps[i].progress);
        setCurrentStep(steps[i].text);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => router.push('/verify-access-code'), 1000);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isRevealing, router]);

  const isUsernameValid = validateUsername(username);
  const areFeaturesDisabled = !userData?.avatarValid;
  const activeFeature = features.find((f) => f.id === activeModal);

  return (
    <div className="min-h-screen bg-neutral-900 px-4 py-8 sm:px-6 lg:px-8">

      {/* Progress Modal */}
      {isRevealing && userData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-800 rounded-2xl p-6 max-w-md w-full border border-neutral-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                Retrieving {activeFeature?.title}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-neutral-700 rounded-full transition-colors">
                <X size={20} className="text-neutral-400" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-neutral-400 mb-2">
                <span>In Progress</span>
                <span>{revealProgress}%</span>
              </div>
              <div className="w-full bg-neutral-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-orange-400 to-pink-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${revealProgress}%` }}
                />
              </div>
            </div>

            <div className="bg-neutral-700 rounded-lg p-3 mb-4">
              <p className="text-neutral-300 text-sm text-center">{currentStep}</p>
            </div>

            <div className="bg-neutral-700 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={userData.avatarUrl} alt={userData.username} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="text-white font-medium lowercase">@{userData.username}</p>
                  <p className="text-neutral-400 text-sm">
                    {revealProgress < 100 ? 'Processing...' : 'Complete!'}
                  </p>
                </div>
              </div>
            </div>

            {revealProgress === 100 && (
              <div className="bg-green-900/30 border border-green-600 rounded-lg p-3">
                <p className="text-green-400 text-sm text-center">✓ Data retrieval successful! Redirecting...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feature Modal */}
      {activeModal && !isRevealing && userData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-800 rounded-2xl p-6 max-w-md w-full border border-neutral-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">{activeFeature?.modalTitle}</h3>
              <button onClick={closeModal} className="p-1 hover:bg-neutral-700 rounded-full transition-colors">
                <X size={20} className="text-neutral-400" />
              </button>
            </div>

            <p className="text-neutral-300 mb-4">{activeFeature?.modalDescription}</p>

            <div className="bg-neutral-700 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={userData.avatarUrl} alt={userData.username} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="text-white font-medium lowercase">@{userData.username}</p>
                  <p className="text-neutral-400 text-sm">Ready to reveal data</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={startRevealProcess}
                className="flex-1 py-3 bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-600 hover:opacity-90 text-white font-medium rounded-lg transition-opacity flex items-center justify-center gap-2"
              >
                <Lock size={16} />
                Reveal Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto flex flex-col space-y-6 max-w-2xl">
        {/* Header Card */}
        <div className="bg-neutral-800 rounded-2xl p-6 sm:p-8">
          {!userData ? (
            <>
              <h1 className="text-neutral-300 mb-4 sm:text-xl font-medium">
                Enter the username you want to check
              </h1>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-start">
                <div className="flex-1">
                  <input
                    className="w-full px-4 py-3 bg-neutral-800 border-2 border-neutral-600 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent lowercase rounded-lg text-neutral-200 transition-colors"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setShowValidation(e.target.value.length > 0);
                      setAvatarError(false);
                    }}
                    autoComplete="off"
                    disabled={loading}
                  />
                  {showValidation && getValidationMessage() && (
                    <p className="mt-2 text-sm text-red-400">{getValidationMessage()}</p>
                  )}
                  {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
                </div>
                <button
                  onClick={fetchInstagramData}
                  disabled={!isUsernameValid || loading}
                  className="px-6 py-3 disabled:bg-neutral-700 rounded-lg disabled:text-neutral-500 disabled:cursor-not-allowed bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-600 hover:opacity-90 text-white font-medium transition-opacity sm:w-auto w-full flex items-center justify-center gap-2 min-w-[120px]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Connect'
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h1 className="text-neutral-300 text-xl font-medium">Instagram Profile</h1>
                <button onClick={handleDisconnect} className="p-2 text-neutral-400 hover:text-neutral-200 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-center gap-4 p-4 bg-neutral-700 rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={userData.avatarUrl}
                  alt={userData.username}
                  className="w-20 h-20 rounded-full object-cover"
                  onError={() => {
                    console.log("FRONTEND: Image failed to load for:", userData.username);
                    setAvatarError(true);
                  }}
                />
                <div className="flex-1">
                  <div className="flex flex-col-reverse lg:flex-row lg:items-center gap-2 mb-2">
                    <h2 className="text-xl lowercase font-bold text-white">@{userData.username}</h2>
                    {userData.avatarValid ? (
                      <span className="bg-green-500 text-xs px-2 py-1 w-fit rounded-full">Connected</span>
                    ) : (
                      <span className="bg-red-500 text-xs px-2 py-1 rounded-full">Failed</span>
                    )}
                  </div>
                  <p className="text-neutral-300 hidden lg:block">
                    {userData.avatarValid ? 'Connected and ready' : 'Profile connection failed'}
                  </p>
                  {!userData.avatarValid && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-red-900/30 border border-red-600 rounded-lg">
                      <AlertCircle size={16} className="text-red-400" />
                      <p className="text-red-400 text-sm">Unable to fetch Instagram profile!</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleDisconnect}
                className="w-full px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="flex flex-col space-y-4 sm:space-y-3">
          {userData && !userData.avatarValid && (
            <div className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-yellow-400" />
                <div>
                  <h3 className="text-yellow-200 font-medium">Features Unavailable</h3>
                  <p className="text-yellow-100 text-sm">
                    Profile connection failed. Please try a different username.
                  </p>
                </div>
              </div>
            </div>
          )}

          {features.map((feature, i) => (
            <div
              key={i}
              onClick={() => handleFeatureClick(feature.id)}
              className={`flex items-center transition-all duration-200 gap-4 border rounded-xl bg-neutral-800 border-neutral-600 px-4 py-4 sm:p-5 ${
                areFeaturesDisabled
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-neutral-700 cursor-pointer'
              }`}
            >
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                {feature.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-neutral-200 font-medium mb-1 text-base sm:text-lg">{feature.title}</h2>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">{feature.description}</p>
              </div>
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                <ChevronRight className="text-neutral-400" size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}