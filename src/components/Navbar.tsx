'use client';

import Link from 'next/link';

export default function Navbar() {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'android') {
      const link = document.createElement('a');
      link.href = '/downloads/Instatroid.apk';
      link.download = 'Instatroid.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (val === 'ios') {
      alert('App not available for iOS yet. Please use the web version.');
    }
    e.target.value = 'default';
  };

  return (
    <nav className="border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 via-pink-500 to-fuchsia-600 flex items-center justify-center text-white font-black text-lg">
              I
            </div>
            <span className="font-bold text-white text-lg hidden sm:block">Instatroid</span>
          </Link>

          {/* Right */}
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-neutral-400 hover:text-white text-sm transition-colors"
            >
              Privacy
            </Link>
            <select
              onChange={handleSelectChange}
              defaultValue="default"
              className="rounded-md text-xs p-1.5 outline-none bg-neutral-900 border border-neutral-600 text-neutral-200 cursor-pointer"
            >
              <option value="default" className="text-neutral-500">— Get app —</option>
              <option value="ios">iOS</option>
              <option value="android">Android</option>
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
}
