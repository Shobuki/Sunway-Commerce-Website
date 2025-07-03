// C:\xampp\htdocs\sunway\sunway-stok\frontdealer\src\pages\ourservice.tsx

import React, { useState } from 'react';
import Head from 'next/head'; // pastikan next/head
import Footer from '../../components/footer';
import Navbar from '../../components/header/navbar'; // pastikan path ini sesuai dengan struktur foldermu
import './ourservicess.css';

type ServiceImage = {
  src: string;
  alt: string;
  heading: string;
  caption?: string;
};

const imgHost = "http://sunflex.com.sg/";

// --- services structure & data (tidak diubah, sama persis punyamu) ---
const services: {
  [key: string]: {
    title: string;
    description: React.ReactNode | null;
    images: ServiceImage[];
  };
} = {
  '24/7/365 Mobile Service': {
    title: 'Leading Mobile Van Service Provider',
    description: (
      <>
        <p><strong>When you sleep, we don't!</strong></p>
        <p>Our 24 hour (7/365 Days) Mobile Service is always there to assist on-site work.</p>
        <p><strong>Call our hotline at (+65) 9019 0019 <a href="http://wa.me/6590190019" target="_blank" rel="noopener noreferrer"><img src="https://th.bing.com/th/id/OSK.fb6Oq3KspMS7HoF4MzZBudO5WiyCfuPN0cbm6fgm0JA?w=46&amp;h=46&amp;c=11&amp;rs=1&amp;qlt=80&amp;o=6&amp;cb=iavawebp1&amp;dpr=1.1&amp;pid=SANGAM" alt="WhatsApp" title="WhatsApp" /></a></strong></p>
      </>
    ),
    images: [
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Van-001.JPG', alt: 'Mobile Van 001', heading: 'Our Fleet And Mobile Specialist' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Van-005.JPG', alt: 'Mobile Van 005', heading: 'Mobile Van On-Site' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Van-008.JPG', alt: 'Mobile Van 008', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Van-007.JPG', alt: 'Mobile Van 007', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Van-5-3-2024.jpg', alt: 'Mobile Van 5 3 2024', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Van-25-1-2023-002.jpg', alt: 'Mobile Van 25 1 2023 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Van-14-3-2024-001.jpg', alt: 'Mobile Van 14 3 2024 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Van-14-3-2024-002.jpg', alt: 'Mobile Van 14 3 2024 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Van-27-3-2024.jpg', alt: 'Mobile Van 27 3 2024', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Van-25-1-2023-003.jpg', alt: 'Mobile Van 25 1 2023 003', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Van-26-1-2023-001.jpg', alt: 'Mobile Van 26 1 2023 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Van-25-1-2023-001.jpg', alt: 'Mobile Van 25 1 2023 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Van-25-1-2023-005.jpg', alt: 'Mobile Van 25 1 2023 005', heading: '' },
    ],
  },
  'Mobile Workshop': {
    title: '', // No specific title for this section in original HTML
    description: null,
    images: [
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Workshop-21-11-2023.jpg', alt: 'Mobile Workshop 21 11 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Workshop-5-10-2023-008.jpg', alt: 'Mobile Workshop 5 10 2023 008', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Workshop-13-09-2023-001.jpg', alt: 'Mobile Workshop 13 09 2023 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Workshop-13-09-2023-003.jpg', alt: 'Mobile Workshop 13 09 2023 003', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Workshop-13-09-2023-004.jpg', alt: 'Mobile Workshop 13 09 2023 004', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Workshop-13-09-2023-005.jpg', alt: 'Mobile Workshop 13 09 2023 005', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Workshop-13-09-2023-002.jpg', alt: 'Mobile Workshop 13 09 2023 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Workshop-13-09-2023-006.jpg', alt: 'Mobile Workshop 13 09 2023 006', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Workshop-13-09-2023-008.jpg', alt: 'Mobile Workshop 13 09 2023 008', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Workshop-13-09-2023-007.jpg', alt: 'Mobile Workshop 13 09 2023 007', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Workshop-14-5-2024-001.jpg', alt: 'Mobile Workshop 14 5 2024 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Mobile-Workshop-14-5-2024-002.jpg', alt: 'Mobile Workshop 14 5 2024 002', heading: '' },
    ],
  },
  'Sunflex Total Rubber Franchise': {
    title: '',
    description: null,
    images: [
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-22-10-2024-002a.jpg', alt: 'Sunflex Total Rubber Franchise 22 10 2024 002A', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-24-10-2024.jpg', alt: 'Sunflex Total Rubber Franchise 24 10 2024', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-22-10-2024-010a.jpg', alt: 'Sunflex Total Rubber Franchise 22 10 2024 010A', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-22-10-2024-005a.jpg', alt: 'Sunflex Total Rubber Franchise 22 10 2024 005A', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-22-10-2024-006a.jpg', alt: 'Sunflex Total Rubber Franchise 22 10 2024 006A', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-22-10-2024-004.jpg', alt: 'Sunflex Total Rubber Franchise 22 10 2024 004', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-22-10-2024-008.jpg', alt: 'Sunflex Total Rubber Franchise 22 10 2024 008', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-22-10-2024-007.jpg', alt: 'Sunflex Total Rubber Franchise 22 10 2024 007', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-22-10-2024-001.jpg', alt: 'Sunflex Total Rubber Franchise 22 10 2024 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-22-10-2024-011.jpg', alt: 'Sunflex Total Rubber Franchise 22 10 2024 011', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-22-10-2024-014.jpg', alt: 'Sunflex Total Rubber Franchise 22 10 2024 014', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-22-10-2024-015a.jpg', alt: 'Sunflex Total Rubber Franchise 22 10 2024 015A', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-22-10-2024-03.jpg', alt: 'Sunflex Total Rubber Franchise 22 10 2024 03', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-22-10-2024-013a.jpg', alt: 'Sunflex Total Rubber Franchise 22 10 2024 013A', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-29-4-2024-001.jpg', alt: 'Sunflex Total Rubber Franchise 29 4 2024 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-8-1-2024-003.jpg', alt: 'Sunflex Total Rubber Franchise 8 1 2024 003', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-8-1-2024-004.jpg', alt: 'Sunflex Total Rubber Franchise 8 1 2024 004', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-29-4-2024-002.jpg', alt: 'Sunflex Total Rubber Franchise 29 4 2024 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-29-4-2024-003.jpg', alt: 'Sunflex Total Rubber Franchise 29 4 2024 003', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-14-12-2024-001.jpg', alt: 'Sunflex Total Rubber Franchise 14 12 2024 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-14-12-2024-002.jpg', alt: 'Sunflex Total Rubber Franchise 14 12 2024 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-14-12-2024-003.jpg', alt: 'Sunflex Total Rubber Franchise 14 12 2024 003', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-14-12-2024-005.jpg', alt: 'Sunflex Total Rubber Franchise 14 12 2024 005', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-14-12-2024-007.jpg', alt: 'Sunflex Total Rubber Franchise 14 12 2024 007', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-14-12-2024-009.jpg', alt: 'Sunflex Total Rubber Franchise 14 12 2024 009', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-14-12-2024-006.jpg', alt: 'Sunflex Total Rubber Franchise 14 12 2024 006', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-14-12-2024-008.jpg', alt: 'Sunflex Total Rubber Franchise 14 12 2024 008', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-14-12-2024-004.jpg', alt: 'Sunflex Total Rubber Franchise 14 12 2024 004', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Total-Rubber-Franchise-14-12-2024-010.jpg', alt: 'Sunflex Total Rubber Franchise 14 12 2024 010', heading: '' },
    ],
  },
  'Customised Fabrications': {
    title: 'In-House Hose Assembly',
    description: null,
    images: [
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Hose-Assembly-001.jpg', alt: 'Hose Assembly 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Hose-Assembly-002.jpg', alt: 'Hose Assembly 002', heading: '', caption: 'Finn-Power King Crimper 1200' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-10-08-2023.jpg', alt: 'Fabrication Customize 10 08 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-10-12-2022.jpg', alt: 'Fabrication Customize 10 12 2022', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-31-09-2022.jpeg', alt: 'Fabrication Customize 31 09 2022', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-18-03-2022.jpeg', alt: 'Fabrication 18 03 2022', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-03-04-2024.jpg', alt: 'Fabrication Customize 03 04 2024', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-28-11-2023.jpg', alt: 'Fabrication Customize 28 11 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-27-1-2023.jpg', alt: 'Fabrication Customize 27 1 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-11-5-2023.jpg', alt: 'Fabrication Customize 11 5 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-26-08-2022-002.jpeg', alt: 'Fabrication Customize 26 08 2022 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-17-08-2022-001.jpeg', alt: 'Fabrication Customize 17 08 2022 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Hose-Assembly-006.jpg', alt: 'Hose Assembly 006', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-5-07-2022.jpeg', alt: 'Fabrication Customize 5 07 2022', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-25-03-2022.jpeg', alt: 'Fabrication 25 03 2022', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-22-09-2022-001.jpeg', alt: 'Fabrication Customize 22 09 2022 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-8-12-2022-002.jpg', alt: 'Fabrication Customize 8 12 2022 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-26-1-2024.jpg', alt: 'Fabrication Customize 26 1 2024', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-05-07-2023.jpg', alt: 'Fabrication Customize 05 07 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-05-01-2024.jpg', alt: 'Fabrication Customize 05 01 2024', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-22-06-2022.jpeg', alt: 'Fabrication Customize 22 06 2022', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-8-12-2022-001.jpg', alt: 'Fabrication Customize 8 12 2022 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-26-3-2023.jpg', alt: 'Fabrication Customize 26 3 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-01-06-2022-002.jpg', alt: 'Fabrication Customize 01 06 2022 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-10-11-2023.jpg', alt: 'Fabrication Customize 10 11 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-15-09-2022.jpeg', alt: 'Fabrication Customize 15 09 2022', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-25-03-2022-001.jpeg', alt: 'Cnc Eng 25 03 2022 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-19-4-2023.jpg', alt: 'Fabrication Customize 19 4 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-25-03-2022-002.jpeg', alt: 'Cnc Eng 25 03 2022 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-22-09-2022-002.jpeg', alt: 'Fabrication Customize 22 09 2022 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-28-06-2022.jpeg', alt: 'Fabrication Customize 28 06 2022', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-20-10-2022-002.jpg', alt: 'Fabrication Customize 20 10 2022 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-26-09-2023.jpg', alt: 'Fabrication Customize 26 09 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-27-12-2022.jpg', alt: 'Fabrication Customize 27 12 2022', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-26-08-2022-001.jpeg', alt: 'Fabrication Customize 26 08 2022 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-25-10-2022.jpg', alt: 'Fabrication Customize 25 10 2022', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-29-07-2022.jpeg', alt: 'Fabrication Customize 29 07 2022', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-19-04-2022.jpeg', alt: 'Fabrication Customize 19 04 2022', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Hose-Assembly-004.jpg', alt: 'Hose Assembly 004', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Hose-Assembly-028.jpg', alt: 'Hose Assembly 028', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-007.jpg', alt: 'Fabrication 007', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-005.jpg', alt: 'Fabrication 005', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Welding-002.jpg', alt: 'Welding 002', heading: 'In-House Welding Specialist' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-07-06-2022-002.jpg', alt: 'Fabrication Customize 07 06 2022 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-22-11-2022-002.jpg', alt: 'Fabrication Customize 22 11 2022 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-20-10-2022-001.jpg', alt: 'Fabrication Customize 20 10 2022 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-07-07-2023.jpg', alt: 'Fabrication Customize 07 07 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-3-11-2022-003.jpg', alt: 'Fabrication Customize 3 11 2022 003', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-10-06-2022.jpg', alt: 'Fabrication Customize 10 06 2022', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-015.jpg', alt: 'Fabrication 015', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-002.jpg', alt: 'Fabrication 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-22-03-2022-002.jpeg', alt: 'Fabrication 22 03 2022 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-001.jpg', alt: 'Fabrication 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-24-3-2024-001.jpg', alt: 'Fabrication Customize 24 3 2024 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-24-3-2024-002.jpg', alt: 'Fabrication Customize 24 3 2024 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-24-3-2024-003.jpg', alt: 'Fabrication Customize 24 3 2024 003', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-14-05-2024-002.jpg', alt: 'Fabrication Customize 14 05 2024 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-14-05-2024-001.jpg', alt: 'Fabrication Customize 14 05 2024 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-14-05-2024-004.jpg', alt: 'Fabrication Customize 14 05 2024 004', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-17-05-2024.jpg', alt: 'Fabrication Customize 17 05 2024', heading: '' },
    ],
  },
  'Specialty Hose Manufacturing': {
    title: '',
    description: null,
    images: [
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Specialty-Hose-Manufacturing-11-5-2023.jpg', alt: 'Specialty Hose Manufacturing 11 5 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Specialty-Hose-Manufacturing-15-5-2023.jpg', alt: 'Specialty Hose Manufacturing 15 5 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Specialty-Hose-Manufacturing-10-7-2023.jpg', alt: 'Specialty Hose Manufacturing 10 7 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Specialty-Hose-Manufacturing-25-1-2024.jpg', alt: 'Specialty Hose Manufacturing 25 1 2024', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Specialty-Hose-Manufacturing-12-4-2023-001.jpg', alt: 'Specialty Hose Manufacturing 12 4 2023 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Specialty-Hose-Manufacturing-16-5-2023.jpg', alt: 'Specialty Hose Manufacturing 16 5 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Specialty-Hose-Manufacturing-12-4-2023-002.jpg', alt: 'Specialty Hose Manufacturing 12 4 2023 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Specialty-Hose-Manufacturing-12-4-2023-003.jpg', alt: 'Specialty Hose Manufacturing 12 4 2023 003', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Specialty-Hose-Manufacturing-12-4-2023-004.jpg', alt: 'Specialty Hose Manufacturing 12 4 2023 004', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Specialty-Hose-Manufacturing-12-4-2023-005.jpg', alt: 'Specialty Hose Manufacturing 12 4 2023 005', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Specialty-Hose-Manufacturing-12-4-2023-006.jpg', alt: 'Specialty Hose Manufacturing 12 4 2023 006', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Specialty-Hose-Manufacturing-12-4-2023-008.jpg', alt: 'Specialty Hose Manufacturing 12 4 2023 008', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Specialty-Hose-Manufacturing-12-4-2023-009.jpg', alt: 'Specialty Hose Manufacturing 12 4 2023 009', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-Customize-22-11-2022-001.jpg', alt: 'Fabrication Customize 22 11 2022 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Specialty-Hose-22-11-2022-001.jpg', alt: 'Specialty Hose 22 11 2022 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Specialty-Hose-Manufacturing-27-7-2023.jpg', alt: 'Specialty Hose Manufacturing 27 7 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Batam005.JPG', alt: 'Batam005', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Specialty-Hose-Manufacturing-12-4-2023-010.jpg', alt: 'Specialty Hose Manufacturing 12 4 2023 010', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Specialty-Hose-Manufacturing-12-4-2023-007.jpg', alt: 'Specialty Hose Manufacturing 12 4 2023 007', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Batam-Production-005.jpg', alt: 'Batam Production 005', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Specialty-Hose-Manufacturing-25-3-2024-001.jpg', alt: 'Specialty Hose Manufacturing 25 3 2024 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Specialty-Hose-Manufacturing-25-3-2024-002.jpg', alt: 'Specialty Hose Manufacturing 25 3 2024 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Specialty-Hose-Manufacturing-25-3-2024-003.jpg', alt: 'Specialty Hose Manufacturing 25 3 2024 003', heading: '' },
    ],
  },
  'SUNFLEX Laboratory': {
    title: '',
    description: null,
    images: [
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Laboratory-14-2-2024-001.jpg', alt: 'Sunflex Laboratory 14 2 2024 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Laboratory-14-2-2024-002.jpg', alt: 'Sunflex Laboratory 14 2 2024 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Laboratory-14-2-2024-003.jpg', alt: 'Sunflex Laboratory 14 2 2024 003', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Laboratory-14-2-2024-004.jpg', alt: 'Sunflex Laboratory 14 2 2024 004', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Laboratory-14-2-2024-005.jpg', alt: 'Sunflex Laboratory 14 2 2024 005', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Laboratory-14-2-2024-006.jpg', alt: 'Sunflex Laboratory 14 2 2024 006', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Laboratory-14-2-2024-007.jpg', alt: 'Sunflex Laboratory 14 2 2024 007', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Laboratory-14-2-2024-008.jpg', alt: 'Sunflex Laboratory 14 2 2024 008', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Laboratory-14-2-2024-009.jpg', alt: 'Sunflex Laboratory 14 2 2024 009', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Sunflex-Laboratory-14-2-2024-010.jpg', alt: 'Sunflex Laboratory 14 2 2024 010', heading: '' },
    ],
  },
  'Inspection, Pressure Testing & Re-Certification': {
    title: '',
    description: null,
    images: [
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Inspection-Pressure-Testing-10-2-2025.jpg', alt: 'Inspection Pressure Testing 10 2 2025', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Inspection-Pressure-Testing-20-1-2024.jpg', alt: 'Inspection Pressure Testing 20 1 2024', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Hose-Testing-002.jpg', alt: 'Hose Testing 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Hydrostatic-Testing-005.jpg', alt: 'Hydrostatic Testing 005', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Inspection-Pressure-Testing-1-11-2023.jpg', alt: 'Inspection Pressure Testing 1 11 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Hydrostatic-Testing-10-11-2023-001.jpg', alt: 'Hydrostatic Testing 10 11 2023 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Hydrostatic-Testing-10-11-2023-002.jpg', alt: 'Hydrostatic Testing 10 11 2023 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Hydrostatic-Testing-21-11-2023.jpg', alt: 'Hydrostatic Testing 21 11 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Hydrostatic-Testing-10-11-2023-003.jpg', alt: 'Hydrostatic Testing 10 11 2023 003', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Inspection-Pressure-Testing-19-12-2023.jpg', alt: 'Inspection Pressure Testing 19 12 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Inspection-Pressure-Testing-10-3-2023.jpg', alt: 'Inspection Pressure Testing 10 3 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Hydrostatic-Testing-21-03-2022.jpeg', alt: 'Hydrostatic Testing 21 03 2022', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Test-Inpsection-and-Equipment-001.jpg', alt: 'Test Inpsection and Equipment 001', heading: 'Hydrostatic Pressure Testing with Chart Recording' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Hydrostatic-Testing-004.jpg', alt: 'Hydrostatic Testing 004', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Hydrostatic-Testing-006.jpg', alt: 'Hydrostatic Testing 006', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Test-Inpsection-and-Equipment-002.jpg', alt: 'Test Inpsection and Equipment 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Test-Inpsection-and-Equipment-004.jpg', alt: 'Test Inpsection and Equipment 004', heading: 'Borescope Inspection Camera For Inner Tube Hose' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Hydrostatic-Testing-27-10-2022.jpg', alt: 'Hydrostatic Testing 27 10 2022', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Hydrostatic-Testing-003.jpg', alt: 'Hydrostatic Testing 003', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Test-Inpsection-and-Equipment-005.jpg', alt: 'Test Inpsection and Equipment 005', heading: 'Portable Pressure Testing Equipment' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Inspection-Pressure-Testing-22-09-2022-001.jpeg', alt: 'Inspection Pressure Testing 22 09 2022 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Hydrostatic-Testing-6-11-2022.jpg', alt: 'Hydrostatic Testing 6 11 2022', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Inspection-Pressure-Testing-22-09-2022-002.jpeg', alt: 'Inspection Pressure Testing 22 09 2022 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Hose-Testing-001.jpg', alt: 'Hose Testing 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Hydrostatic-Testing-23-11-2023.jpg', alt: 'Hydrostatic Testing 23 11 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Test-Inpsection-and-Equipment-003.jpg', alt: 'Test Inpsection and Equipment 003', heading: 'Inspection, Pressure Testing and Re-Certification For Third Party Hose' },
    ],
  },
  'CNC Engineering': {
    title: 'CNC Engineering',
    description: null,
    images: [
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-005.jpg', alt: 'Cnc Eng 005', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-12-5-2023.jpg', alt: 'Cnc Eng 12 5 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-10-11-2023-003.jpg', alt: 'Cnc Eng 10 11 2023 003', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Engineering-03-04-2024-001.jpg', alt: 'Cnc Engineering 03 04 2024 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-27-07-2023.jpg', alt: 'CNC 27 07 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Engineering-03-04-2024-002.jpg', alt: 'Cnc Engineering 03 04 2024 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-10-11-2023-002.jpg', alt: 'Cnc Eng 10 11 2023 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-10-11-2023-001.jpg', alt: 'Cnc Eng 10 11 2023 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-007.jpg', alt: 'Cnc Eng 007', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-006.jpg', alt: 'Cnc Eng 006', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-001.jpg', alt: 'Cnc Eng 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-29-03-2022.jpeg', alt: 'Cnc Eng 29 03 2022', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-003.jpg', alt: 'Cnc Eng 003', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-004.jpg', alt: 'Cnc Eng 004', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-8-6-2023.jpg', alt: 'Cnc Eng 8 6 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-008.jpg', alt: 'Cnc Eng 008', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-7-7-2023.jpg', alt: 'Cnc Eng 7 7 2023', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-009.jpg', alt: 'Cnc Eng 009', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-010.jpg', alt: 'Cnc Eng 010', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-008.jpg', alt: 'Fabrication 008', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-010.jpg', alt: 'Fabrication 010', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-011.jpg', alt: 'Fabrication 011', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-012.jpg', alt: 'Fabrication 012', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-011.jpg', alt: 'Cnc Eng 011', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-013.jpg', alt: 'Fabrication 013', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Fabrication-014.jpg', alt: 'Fabrication 014', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-30-08-2022-001.jpeg', alt: 'Cnc Eng 30 08 2022 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-30-08-2022-002.jpeg', alt: 'Cnc Eng 30 08 2022 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-14-5-2024-001.jpg', alt: 'Cnc Eng 14 5 2024 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-14-5-2024-002.jpg', alt: 'Cnc Eng 14 5 2024 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-14-5-2024-003.jpg', alt: 'Cnc Eng 14 5 2024 003', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-25-3-2024-001.jpg', alt: 'Cnc Eng 25 3 2024 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-25-3-2024-002.jpg', alt: 'Cnc Eng 25 3 2024 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/CNC-Eng-25-3-2024-003.jpg', alt: 'Cnc Eng 25 3 2024 003', heading: '' },
    ],
  },
  'Piping And Tubing': {
    title: '',
    description: null,
    images: [
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Piping-Tubing-8-11-2024-002.jpg', alt: 'Piping Tubing 8 11 2024 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Piping-Tubing-8-11-2024-001.jpg', alt: 'Piping Tubing 8 11 2024 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Piping-Tubing-002.jpg', alt: 'Piping Tubing 002', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Piping-Tubing-001.jpg', alt: 'Piping Tubing 001', heading: 'Tubing' },
    ],
  },
  'Hose Cleaning / Hose Flushing': {
    title: 'Hose Cleaning / Hose Flushing',
    description: (
      <p>Dirt, moisture and contaminants can lead to hose damage which contribute to costly breakdowns and loss of production time. Sunway provides additional flushing &amp; cleaning services in accordance with NAS 1638 cleanliness standard, thus providing protection against contaminants.</p>
    ),
    images: [
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Hose-Cleaning-Machine.jpg', alt: 'Hose Cleaning Machine', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Hose-Cleaning-6-4-2022-001.jpeg', alt: 'Hose Cleaning 6 4 2022 001', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Hose-Cleaning-6-4-2022-002.jpeg', alt: 'Hose Cleaning 6 4 2022 002', heading: '' },
    ],
  },
  'Projects We Involved': {
    title: 'Our Clients',
    description: null,
    images: [
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Oil-Company-7.png', alt: 'Oil Company 7', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Oil-Company-4.png', alt: 'Oil Company 4', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Indonesia-11.jpg', alt: 'Indonesia 11', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Indonesia-7.jpg', alt: 'Indonesia 7', heading: '' },
      { src: 'public/images/mobileservice/_800x550_crop_center-center/Indonesia-12.jpg', alt: 'Indonesia 12', heading: '' },
    ],
  },
};

// Daftar list service
const serviceList = Object.keys(services);

const OurService: React.FC = () => {
  const [activeService, setActiveService] = useState(serviceList[0]);
  const currentService = services[activeService];

  return (
    <>
      <Head>
        <title>Our Services | Sunway</title>
      </Head>
      <div style={{
        background: "url('http://sunflex.com.sg/public/images/Grey-bg.jpg') repeat",
        minHeight: "100vh"
      }}>
        {/* Navbar */}
        <Navbar />
        <div className="py-8 px-2">
          <div className="max-w-7xl mx-auto flex flex-col  md:flex-row gap-8 p-4 md:p-10">
            {/* Sidebar */}
            <aside className="w-full md:w-60 shrink-0">
              <div className="bg-white/95 rounded-2xl shadow-lg border-l-4 border-red-500 mb-6 p-4">
                <h2 className="font-bold text-2xl text-red-700 mb-2">Our Services</h2>
                <ul>
                  {serviceList.map((service) => (
                    <li key={service}>
                      <button
                        onClick={() => setActiveService(service)}
                        className={`block w-full text-left px-4 py-2 my-1 rounded-xl font-medium transition 
                        ${activeService === service
                            ? "bg-red-600 text-white shadow"
                            : "hover:bg-red-100 text-red-700"}`}
                      >
                        {service}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {(currentService.title || currentService.description) && (
                <div className="bg-white/95 rounded-2xl shadow-lg border-t-4 border-red-600 p-6 mb-4">
                  {currentService.title && (
                    <h1 className="text-3xl font-bold text-red-700 mb-3">{currentService.title}</h1>
                  )}
                  {currentService.description && (
                    <div className="text-md text-gray-700 mb-6">{currentService.description}</div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {currentService.images.map((img, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden border-2 border-red-200 bg-white shadow-lg flex flex-col">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 200,
                        maxHeight: 350,
                        background: '#f8f8fa',
                        width: '100%',
                      }}
                    >
                      <img
                        src={imgHost + img.src}
                        alt={img.alt}
                        style={{
                          objectFit: 'contain',
                          maxHeight: 350,
                          maxWidth: '100%',
                          width: 'auto',
                          height: 'auto',
                          display: 'block',
                          margin: '0 auto',
                        }}
                      />
                    </div>
                    {img.heading && (
                      <div className="p-3 pb-0">
                        <h2 className="font-semibold text-red-700 text-lg">{img.heading}</h2>
                      </div>
                    )}
                    {img.caption && (
                      <div className="p-3 pt-1 text-sm text-gray-600">{img.caption}</div>
                    )}
                  </div>
                ))}
              </div>
            </main>
          </div>
          <Footer />

        </div>
      </div>
      <style jsx global>{`
        body {
          background: none !important;
        }
      `}</style>
    </>
  );
}

export default OurService;