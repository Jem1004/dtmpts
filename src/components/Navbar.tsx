'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const menuItems = [
    { label: 'Beranda', link: '/' },
    {
      label: 'Profil',
      dropdown: [
        { label: 'Visi Misi', link: '/profil/visi-misi' },
        { label: 'Struktur Organisasi', link: '/profil/struktur' },
        { label: 'Sambutan Kepala Dinas', link: '/profil/sambutan' },
      ],
    },
    {
      label: 'Layanan',
      dropdown: [
        { label: 'Perizinan', link: '/layanan/perizinan' },
        { label: 'Non-Perizinan', link: '/layanan/non-perizinan' },
      ],
    },
    {
      label: 'Program',
      dropdown: [
        { label: 'Program Unggulan', link: '/program/unggulan' },
      ],
    },
    {
      label: 'Data',
      dropdown: [
        { label: 'Statistik Investasi', link: '/data/statistik' },
      ],
    },
    {
      label: 'Info',
      dropdown: [
        { label: 'Berita', link: '/berita' },
        { label: 'Pengumuman', link: '/pengumuman' },
      ],
    },
    { label: 'SDP', link: '/sdp' },
    { label: 'Standar Pelayanan', link: '/standar-pelayanan' },
    { label: 'Berita', link: '/berita' },
    { label: 'Masuk', link: '/admin' },
  ];

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/logo-dpmptsp-ppu.png"
              alt="Logo DPMPTSP Penajam Paser Utara"
              width={50}
              height={50}
              className="h-12 w-auto"
            />
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-primary">
                DPMPTSP
              </h1>
              <p className="text-sm text-gray-600">
                Penajam Paser Utara
              </p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            {menuItems.map((item) => (
              <div key={item.label} className="relative group">
                {item.dropdown ? (
                  <>
                    <button
                      className="px-3 py-2 text-gray-700 hover:text-primary transition-colors duration-200 flex items-center space-x-1"
                      onClick={() => toggleDropdown(item.label)}
                    >
                      <span>{item.label}</span>
                      <svg
                        className="w-4 h-4 transition-transform duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {/* Dropdown */}
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-1">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.label}
                            href={subItem.link}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary hover:text-white transition-colors duration-200"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.link}
                    className="px-3 py-2 text-gray-700 hover:text-primary transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-md text-gray-700 hover:text-primary focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden pb-4">
            {menuItems.map((item) => (
              <div key={item.label}>
                {item.dropdown ? (
                  <>
                    <button
                      className="w-full text-left px-3 py-2 text-gray-700 hover:text-primary transition-colors duration-200 flex items-center justify-between"
                      onClick={() => toggleDropdown(item.label)}
                    >
                      <span>{item.label}</span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === item.label ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {activeDropdown === item.label && (
                      <div className="pl-6">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.label}
                            href={subItem.link}
                            className="block px-3 py-2 text-sm text-gray-600 hover:text-primary transition-colors duration-200"
                            onClick={() => setIsOpen(false)}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.link}
                    className="block px-3 py-2 text-gray-700 hover:text-primary transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;