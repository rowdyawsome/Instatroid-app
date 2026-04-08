import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
      <p className="text-4xl font-bold">404</p>
      <Link href="/" className="text-pink-400 hover:text-pink-300 text-sm font-medium underline transition-colors">
        Go Home
      </Link>
    </div>
  );
}
