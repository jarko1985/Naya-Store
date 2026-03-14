'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Truck,
  ShoppingBag,
  Gift,
  ShieldCheck,
  Headphones,
  Phone,
  Mail,
  ChevronDown,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
} from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Shipped free with love',
    description: 'On orders above AED 250',
  },
  {
    icon: ShoppingBag,
    title: 'Click & Collect',
    description: 'available in Naya Store',
  },
  {
    icon: Gift,
    title: 'Delivered in 1-7 Days',
    description: 'and packed with love',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payment',
    description: 'Apple pay, Credit & Debit Cards',
  },
  {
    icon: Headphones,
    title: '24×7 Email Support',
    description: 'Consultations via Email',
  },
];

const navSections = [
  {
    title: 'Shop Online',
    links: ['Men', 'Women', 'Kids', 'Homeware', 'Lifestyle', 'Offer'],
  },
  {
    title: 'Customer Policies',
    links: [
      'Contact us',
      'About Us',
      'Terms & Conditions',
      'Privacy',
      'Reward Policy',
      'Return & Refund Policies',
    ],
  },
  // {
  //   title: 'Resources',
  //   links: ['Blogs'],
  // },
  // {
  //   title: 'Other Countries',
  //   links: ['Qatar', 'Bahrain', 'Saudi Arabia', 'United Arab Emirates', 'Jordan', 'Oman'],
  // },
];

const socialLinks = [
  { icon: Facebook, href: '#' },
  { icon: Twitter, href: '#' },
  { icon: Linkedin, href: '#' },
  { icon: Instagram, href: '#' },
  { icon: Youtube, href: '#' },
];

const paymentMethods = [
  { label: 'Apple Pay' },
  { label: 'Google Pay' },
  { label: 'Mastercard' },
  { label: 'Samsung Pay' },
  { label: 'VISA' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggle = (title: string) =>
    setOpenSection((prev) => (prev === title ? null : title));

  return (
    <footer className='border-t bg-white'>
      {/* ── Features ── */}
      <div className='border-b'>
        <div className='max-w-7xl mx-auto px-4 py-10'>
          {/* Desktop */}
          <div className='hidden md:grid md:grid-cols-5 gap-6'>
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className='flex flex-col gap-3'>
                <Icon className='w-8 h-8' strokeWidth={1.5} />
                <div>
                  <p className='font-semibold text-sm'>{title}</p>
                  <p className='text-sm text-gray-500'>{description}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Mobile */}
          <div className='md:hidden space-y-6'>
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className='flex items-start gap-4'>
                <Icon className='w-8 h-8 shrink-0' strokeWidth={1.5} />
                <div>
                  <p className='font-semibold text-sm'>{title}</p>
                  <p className='text-sm text-gray-500'>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Subscribe (mobile only) ── */}
      <div className='md:hidden border-b px-4 py-8'>
        <h3 className='text-xl font-bold mb-1'>Subscribe to our awesome emails.</h3>
        <p className='text-sm text-gray-500 mb-4'>
          Get our latest offers and news straight in your inbox.
        </p>
        <div className='flex gap-0'>
          <input
            type='email'
            placeholder='Enter email address'
            className='flex-1 bg-gray-100 border border-gray-200 px-3 py-2 text-sm focus:outline-none'
          />
          <button className='bg-black text-white px-5 py-2 text-sm font-medium shrink-0'>
            Subscribe
          </button>
        </div>
      </div>

      {/* ── Nav columns (mobile: collapsible) ── */}
      <div className='md:hidden border-b'>
        {navSections.map(({ title, links }) => (
          <div key={title} className='border-b last:border-b-0'>
            <button
              className='w-full flex items-center justify-between px-4 py-4 font-semibold text-sm'
              onClick={() => toggle(title)}
            >
              {title}
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  openSection === title ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSection === title && (
              <ul className='px-4 pb-4 space-y-2'>
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href='#'
                      className='text-sm text-gray-500 hover:text-black transition-colors'
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* ── Nav columns + Subscribe (desktop) ── */}
      <div className='hidden md:block border-b'>
        <div className='max-w-7xl mx-auto px-4 py-10 grid grid-cols-[1fr_1fr_1.4fr] gap-8'>
          {navSections.map(({ title, links }) => (
            <div key={title}>
              <h3 className='font-semibold text-sm mb-4'>{title}</h3>
              <ul className='space-y-2'>
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href='#'
                      className='text-sm text-gray-500 hover:text-black transition-colors'
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Subscribe */}
          <div>
            <h3 className='text-xl font-bold mb-1'>Subscribe to our awesome emails.</h3>
            <p className='text-sm text-gray-500 mb-4'>
              Get our latest offers and news straight in your inbox.
            </p>
            <div className='flex gap-0 mb-6'>
              <input
                type='email'
                placeholder='Enter email address'
                className='flex-1 bg-gray-100 border border-gray-200 px-3 py-2 text-sm focus:outline-none min-w-0'
              />
              <button className='bg-black text-white px-4 py-2 text-sm font-medium shrink-0'>
                Subscribe
              </button>
            </div>
            {/* Social icons */}
            <div className='flex gap-4 flex-wrap mb-6'>
              {socialLinks.map(({ icon: Icon, href }, i) => (
                <Link key={i} href={href} className='hover:opacity-60 transition-opacity'>
                  <Icon className='w-5 h-5' />
                </Link>
              ))}
            </div>
            {/* Payment methods */}
            <div className='flex flex-wrap gap-2'>
              {paymentMethods.map(({ label }) => (
                <span
                  key={label}
                  className='border border-gray-300 rounded px-2 py-1 text-xs font-semibold'
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust badges ── */}
      <div className='border-b'>
        <div className='max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8'>
          {/* 100% Original */}
          <div className='flex items-center gap-4'>
            <div className='w-14 h-14 rounded-full border-2 border-black flex items-center justify-center shrink-0'>
              <div className='text-center leading-tight'>
                <span className='text-[8px] font-black uppercase block'>100%</span>
                <span className='text-[7px] font-black uppercase block'>ORIGINAL</span>
              </div>
            </div>
            <div>
              <p className='font-bold text-sm'>100 % Original</p>
              <p className='text-sm text-gray-500'>Guarantee for all products at naya.store</p>
            </div>
          </div>
          {/* Return 28 days */}
          <div className='flex items-center gap-4'>
            <div className='w-14 h-14 rounded-full border-2 border-black flex items-center justify-center shrink-0'>
              <span className='text-sm font-bold'>28</span>
            </div>
            <div>
              <p className='font-bold text-sm'>Return within 28 days</p>
              <p className='text-sm text-gray-500'>of receiving your order</p>
            </div>
          </div>
        </div>

        {/* Payment methods (mobile only) */}
        <div className='md:hidden px-4 pb-8 flex flex-wrap gap-2'>
          {paymentMethods.map(({ label }) => (
            <span
              key={label}
              className='border border-gray-300 rounded px-3 py-2 text-xs font-semibold'
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Contact + Logo ── */}
      <div className='border-b'>
        <div className='max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-8'>
          <div className='flex flex-col md:flex-row gap-8'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center shrink-0'>
                <Phone className='w-5 h-5' strokeWidth={1.5} />
              </div>
              <div>
                <p className='text-sm text-gray-500'>Talk to us</p>
                <p className='font-bold text-sm'>043131000</p>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center shrink-0'>
                <Mail className='w-5 h-5' strokeWidth={1.5} />
              </div>
              <div>
                <p className='text-sm text-gray-500'>Write to us</p>
                <p className='font-bold text-sm'>support@naya.store</p>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center shrink-0'>
                <Headphones className='w-5 h-5' strokeWidth={1.5} />
              </div>
              <div>
                <p className='text-sm text-gray-500'>Help Center</p>
                <p className='font-bold text-sm'>naya_store</p>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className='flex items-center justify-start md:justify-end'>
            <Image
              src='/images/logo/logo_256.svg'
              alt='Naya Store'
              width={140}
              height={70}
              className='object-contain'
            />
          </div>
        </div>
      </div>

      {/* ── Copyright ── */}
      <div>
        <div className='max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-1 text-sm text-gray-500'>
          <p>Copyright © {currentYear} Naya Store all rights reserved.</p>
          <p>Designed by Webandcrafts</p>
        </div>
      </div>
    </footer>
  );
}
