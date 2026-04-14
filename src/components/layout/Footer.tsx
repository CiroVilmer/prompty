'use cache';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-sm text-gray-400">
        <span>
          &copy; {new Date().getFullYear()} Prompty. All rights reserved.
        </span>
        <span>Built with Next.js 16</span>
      </div>
    </footer>
  );
}
