// src/pages/sunwayintro/aboutus.tsx

import React, { useState } from "react";
import Head from "next/head";
import Navbar from "../../components/header/navbar";
import Footer from "../../components/footer";

const aboutTabs = [
  { label: "Our Profile", key: "profile" },
  { label: "Our Reach", key: "reach" },
  { label: "Certificates", key: "certificates" },
  { label: "Our Activities", key: "activities" },
  { label: "Quality Policy", key: "quality" },
  { label: "Vision & Mission Statement", key: "vision" },
];

const imgHost = "http://sunflex.com.sg/";

function AboutUs() {
  const [tab, setTab] = useState(aboutTabs[0].key);

  return (
    <>
      <Head>
        <title>About Us | Sunway Marketing</title>
      </Head>
      <div
        style={{
          background: `url('${imgHost}public/images/Grey-bg.jpg') repeat`,
          minHeight: "100vh",
        }}
      >
        <Navbar />
        <div className="py-8 px-2">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 p-4 md:p-10">
            {/* Sidebar */}
            <aside className="w-full md:w-60 shrink-0">
              <div className="bg-white/95 rounded-2xl shadow-lg border-l-4 border-orange-500 mb-6 p-4">
                <div className="flex justify-center mb-4">
                  <img
                    src="http://sunflex.com.sg/public/images/sunway-logotype.png"
                    style={{ maxWidth: 170, height: "auto" }}
                    alt="Sunway logo"
                  />
                </div>
                <ul>
                  {aboutTabs.map((item) => (
                    <li key={item.key}>
                      <button
                        onClick={() => setTab(item.key)}
                        className={`block w-full text-left px-4 py-2 my-1 rounded-xl font-medium transition ${
                          tab === item.key
                            ? "bg-orange-600 text-white shadow"
                            : "hover:bg-orange-100 text-orange-800"
                        }`}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-[500px]">
              {tab === "profile" && <Profile />}
              {tab === "reach" && <Reach />}
              {tab === "certificates" && <Certificates />}
              {tab === "activities" && <Activities />}
              {tab === "quality" && <QualityPolicy />}
              {tab === "vision" && <VisionMission />}
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

// ==== Semua isi konten section AboutUs (per tab) ====

function Profile() {
  return (
    <div className="bg-white/95 rounded-2xl shadow-lg border-t-4 border-orange-500 p-6 mb-4">
      <h1 className="text-3xl font-bold text-orange-700 mb-4">Our Profile</h1>
      <p>
        Sunway Marketing (S) Pte Ltd arose from its humble beginnings servicing
        and renting machinery equipment in 1975 to a leading one stop provider
        of Hoses, Fittings, Couplings, Tubes, Accessories today.
      </p>
      <p>
        The Company being part of the Sunway Trading and Manufacturing Division
        of the Sunway Group, a leading Malaysian Congolomerate has an extended
        presence in the Asia Pacific region with manufacturing, operation and
        warehousing facilities.
      </p>
      <p>
        The Company offers one stop solutions for your hose and fitting needs
        and is a stockist for some of the leading brands in the industry. Our
        own SUNFLEX brand has a proven track for quality and we offer both
        excellent pre and post sales services. Our fabrication and Mobile
        24-hour Services provide the added quality and quick response services
        to our customers.
      </p>
      <p>
        The Company also offers the CASE Construction Range of Heavy Equipment,
        Airman Range of Compressors and Generators and a huge range of Hardware
        Products.
      </p>
      <p>
        Sunway Marketing (S) Pte Ltd leverages on all of the above to
        successfully differentiate itself from its competitors. The Company
        serves its many customers in the sectors of Construction, Offshore,
        Marine, Oil &amp; Gas and Shipyard as well as transportation, mining and
        logging.
      </p>
      <p>
        Sunway Marketing (S) Pte Ltd is ISO 9001:2015 certified and a member of
        NAHAD (Association for Hoses and Accessories Distribution).
      </p>
      <div className="mt-8">
        <h3 className="font-bold text-orange-800">Contact Information</h3>
        <p>
          <b>Main Office</b>: 19 Senoko South Road Singapore 758078
          <br />
          <b>Telephone</b>: +65 6758 5454
          <br />
          <b>Facsimile</b>: +65 6257 8759
        </p>
        <p>
          <b>Branch</b>: 11 Gul Street 4 Singapore 629240
          <br />
          <b>Telephone</b>: +65 6631 9968
          <br />
          <b>Facsimile</b>: +65 6257 8759
        </p>
      </div>
    </div>
  );
}

function Reach() {
  return (
    <div className="bg-white/95 rounded-2xl shadow-lg border-t-4 border-orange-500 p-6 mb-4">
      <h1 className="text-2xl font-bold text-orange-700 mb-4">Our Reach</h1>
      <p>
        Sunway Marketing has a strong presence in the Asia-Pacific region, and we are reaching further to serve you better.
      </p>
      <p>
        The company boasts extensive and warehousing facilities in Singapore, Malaysia, Australia, China, Indonesia, Thailand and Vietnam. For more details on where we are located and how to contact the offices in your country please.
      </p>
    </div>
  );
}

function Certificates() {
  const certs = [
    {
      title: "ISO 9001:2015 Certificate (HQ)",
      src: "public/images/aboutus/_275x275_crop_center-center/ISO-9001-2015-SUNWAY-QMS-2018-030A-HQ-Senoko.png",
    },
    {
      title: "ISO 9001:2015 Certificate (Branch - Gul Street)",
      src: "public/images/aboutus/_275x275_crop_center-center/ISO-9001-2015-SUNWAY-QMS-2018-030B-SITE-Gul.png",
    },
    {
      title: "bizSafe",
      src: "public/images/aboutus/_275x275_crop_center-center/Level-3-Cert-with-Expiry-02.03.2025.jpg",
    },
    {
      title: "Finn Power Distributor",
      src: "public/images/aboutus/_275x275_crop_center-center/finnpower-certificate.jpg",
    },
  ];
  return (
    <div className="bg-white/95 rounded-2xl shadow-lg border-t-4 border-orange-500 p-6 mb-4">
      <h1 className="text-2xl font-bold text-orange-700 mb-4">
        Sunway Marketing is committed to the highest industry standards.
      </h1>
      <p className="mb-8">We are extensively certified by the relevant industry bodies.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {certs.map((cert) => (
          <div
            key={cert.title}
            className="flex flex-col items-center"
          >
            <img
              src={imgHost + cert.src}
              alt={cert.title}
              style={{
                width: "100%",
                maxWidth: 400,
                height: "auto",
                border: "2px solid #f1a145",
                borderRadius: "0", // Tidak ada sudut bulat sama sekali
                display: "block",
                objectFit: "contain", // Supaya gambar tidak pernah crop
                background: "#fff", // Optional, hilangkan jika ingin gambar benar2 tanpa background
                boxShadow: "0 2px 10px #eee", // Optional, hilangkan jika tidak mau bayangan
                marginBottom: 16,
              }}
            />
            <div className="text-center font-medium">{cert.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Activities() {
  return (
    <div className="bg-white/95 rounded-2xl shadow-lg border-t-4 border-orange-500 p-6 mb-4">
      <h1 className="text-2xl font-bold text-orange-700 mb-4">Our Activities</h1>
      <p>
        The principal trading activities of the company and its various divisions are: -
      </p>
      <h3 className="font-semibold mt-4 mb-2">Industrial Products &amp; Heavy Equipment</h3>
      <p>
        Import, Export and sale of full range of Hydraulic &amp; Industrial Hoses &amp; Fittings, Hydraulic Tubes, Tube Fittings, Hose Swaging &amp; Cutting Machine. We also supply hose assembly tailored to customer's requirements. We also offer a large range of Case Construction Equipment , Airman Compressors and Generators.
      </p>
      <h3 className="font-semibold mt-4 mb-2">Market Standing</h3>
      <p>
        In Asia, we are one of the largest stockists of Hoses, Fittings &amp; Couplings. Our quality and "SUNFLEX" brand has a proven track record and our pre and post sales service is the envy of many of our competitors and customers. We are also proud to be recognized distributor for the CASE Construction Equipment &amp; Airman Brand of Compressors and Generators in Singapore.
      </p>
      <h3 className="font-semibold mt-4 mb-2">Bankers</h3>
      <p>
        United Overseas Bank &amp; HSBC Bank have provided import, export and banking facilities for our local and regional trade.
      </p>
    </div>
  );
}

function QualityPolicy() {
  return (
    <div className="bg-white/95 rounded-2xl shadow-lg border-t-4 border-orange-500 p-6 mb-4">
      <h1 className="text-2xl font-bold text-orange-700 mb-4">Quality Policy</h1>
      <p>
        We strive to be a partner with our customers, suppliers, staff and interested parties to enhance and compliment one another in our trading activities.
      </p>
      <p>To achieve this, we shall:</p>
      <ul className="list-disc pl-5 mb-4">
        <li>Provide a conducive environment for knowledge and information sharing and teamwork spirit for personal and overall achievement of optimal productivity and efficiency.</li>
        <li>Make regular visits to customers/suppliers and interested parties to enable better understanding and anticipate their needs and respond appropriately.</li>
        <li>Motivate all to take pride in their work being well done and make possible achievements beyond expectations.</li>
        <li>Provide opportunities to staff for skill upgrading through courses, seminars and internal training.</li>
      </ul>
    </div>
  );
}

function VisionMission() {
  return (
    <div className="bg-white/95 rounded-2xl shadow-lg border-t-4 border-orange-500 p-6 mb-4">
      <h1 className="text-2xl font-bold text-orange-700 mb-4">Vision &amp; Mission Statement</h1>
      <h3 className="font-semibold mt-4 mb-2">Vision</h3>
      <ul className="list-disc pl-5 mb-2">
        <li>
          To be leading conglomerate providing world-class and competitive products and services that enhance stakeholders value.
        </li>
      </ul>
      <h3 className="font-semibold mt-4 mb-2">Mission</h3>
      <ul className="list-disc pl-5 mb-2">
        <li>To provide quality products and services that exceed customers expectation.</li>
        <li>To continuously attract, retain and develop Human Capital.</li>
        <li>To achieve market leadership and operating excellence in every business segment.</li>
      </ul>
      <h3 className="font-semibold mt-4 mb-2">Core Values</h3>
      <ul className="list-disc pl-5">
        <li>Excellence ~ We will have only one standard EXCELLENCE!</li>
        <li>Customers ~ We will strive to exceed customers expectation.</li>
        <li>Motivating Leadership ~ We will lead by example.</li>
        <li>Teamwork ~ We share one Vision, we work as one Team.</li>
        <li>Innovation ~ We will encourage and reward innovation, especially breakthrough ideas.</li>
        <li>Integrity ~ We will conduct professionally and ethically.</li>
      </ul>
    </div>
  );
}

export default AboutUs;
