"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">CGC Training Hub</div>
        <div className="nav-links">
          <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
            Overview (Docs)
          </Link>
          <Link href="/tracker" className={`nav-link ${pathname === '/tracker' ? 'active' : ''}`}>
            Daily Tracker
          </Link>
        </div>
      </div>
    </nav>
  );
}
