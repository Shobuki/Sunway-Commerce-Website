import React from "react";
import Head from "next/head";
import Navbar from '../components/header/navbar';

const brands = [
  { name: "SUNFLEX", desc: "Hoses and Fittings SINGAPORE", img: "http://sunflex.com.sg/public/images/brands/Sunflex-Logo-WITHOUT-WEBSITE-NAME.JPG" },
  { name: "SUNWAY TUBING", desc: "SS316 Tubes SINGAPORE", img: "http://sunflex.com.sg/public/images/brands/Sunway-Tubes.jpg" },
  { name: "AIRMAN", desc: "Air Compressor & Generator Set JAPAN", img: "http://sunflex.com.sg/public/images/brands/AIRMAN.jpg" },
  { name: "BYD", desc: "Material Handling Equipment", img: "http://sunflex.com.sg/public/images/brands/BYD-LOGO.png" },
  { name: "ARTIFEX", desc: "Stainless Steel Flexible Hose ENGLAND", img: "http://sunflex.com.sg/public/images/brands/ARTIFEX.jpg" },
  { name: "BLAGO", desc: "DIN2353 Tube Fittings GERMANY", img: "http://sunflex.com.sg/public/images/brands/BLAGO.jpg" },
  { name: "CASE", desc: "Heavy Equipment USA", img: "http://sunflex.com.sg/public/images/brands/CASE.jpg" },
  { name: "COMPOTEC", desc: "Composite Hose Assembly For Oil etc ITALY", img: "http://sunflex.com.sg/public/images/brands/COMPOTEC.jpg" },
  { name: "COPPER STATE", desc: "High Pressure Oil Field Hoses USA", img: "http://sunflex.com.sg/public/images/brands/CSR.jpg" },
  { name: "DICSA", desc: "Stainless Steel Fittings", img: "http://sunflex.com.sg/public/images/brands/DICSA.jpg" },
  { name: "DISCOVERY", desc: "Hoses and Fittings SINGAPORE", img: "http://sunflex.com.sg/public/images/brands/DISCOVERY.jpg" },
  { name: "DNP", desc: "Quick Release Couplings ITALY", img: "http://sunflex.com.sg/public/images/brands/DNP.jpg" },
  { name: "DOOIN", desc: "Stainless Steel, Carbon Steel & Specialty Material KOREA", img: "http://sunflex.com.sg/public/images/brands/DOOIN.jpg" },
  { name: "EXMAR", desc: "Stainless Steel Fittings GERMANY", img: "http://sunflex.com.sg/public/images/brands/EXMAR.jpg" },
  { name: "FINN POWER", desc: "Hydraulic Coupling Swaging Machines FINLAND", img: "http://sunflex.com.sg/public/images/brands/FINN-POWER.jpg" },
  { name: "FLEXITEC", desc: "Hose Float AUSTRALIA", img: "http://sunflex.com.sg/public/images/brands/FLEXITEC.jpg" },
  { name: "HANDY & HARMAN", desc: "Seamless Coil Tubes USA", img: "http://sunflex.com.sg/public/images/brands/HH-TUBE.jpg" },
  { name: "HOSEBUN", desc: "Hose Saddles CANADA", img: "http://sunflex.com.sg/public/images/brands/HOSEBUN.jpg" },
  { name: "KLAW PRODUCTS", desc: "Safety Breakaway and Dry Disconnect Couplings UK", img: "http://sunflex.com.sg/public/images/brands/KLAW.jpg" },
  { name: "MURRAY", desc: "Stainless Steel Hose Clips USA", img: "http://sunflex.com.sg/public/images/brands/MURRAY.jpg" },
  { name: "NORMA", desc: "HEavy Duty Hose Clamps GERMANY", img: "http://sunflex.com.sg/public/images/brands/NORMA.jpg" },
  { name: "OROFLEX", desc: "Layflat Multi-purpose Hoses SPAIN", img: "http://sunflex.com.sg/public/images/brands/OROFLEX.jpg" },
  { name: "PI.EFFE.CI", desc: "Pipe and Tube Clamps", img: "http://sunflex.com.sg/public/images/brands/Pi.effe.Ci.jpg" },
  { name: "PISTER", desc: "Ball Valves GERMANY", img: "http://sunflex.com.sg/public/images/brands/PISTER.jpg" },
  { name: "SARA", desc: "Hammer Union Couplings INDIA", img: "http://sunflex.com.sg/public/images/brands/SARA.jpg" },
  { name: "SEL", desc: "Fulll Range of Hoses TURKEY", img: "http://sunflex.com.sg/public/images/brands/SEL-EATON.jpg" },
  { name: "SSP FITTINGS", desc: "SS316 Instrumentation Fittings and Adapters USA", img: "http://sunflex.com.sg/public/images/brands/SSP.jpg" },
  { name: "UNIGASKET", desc: "Unigasket Hoses", img: "http://sunflex.com.sg/public/images/brands/unigasket.JPG" },
  { name: "TOTAL RUBBER", desc: "Hoses and Fittings AUSTRALIA", img: "http://sunflex.com.sg/public/images/brands/Total-Rubber.jpg" },
];

export default function OurBrand() {
  return (
    <>
    <Navbar />
      <Head>
        <title>Our Brands | Sunway</title>
        <meta name="description" content="Sunway Marketing only carries products of the highest quality, and to do that we partner with trusted brands that share our level of commitment and dedication." />
      </Head>
      <div
        style={{
          background: "url('http://sunflex.com.sg/public/images/Grey-bg.jpg') repeat",
          minHeight: "100vh",
        }}
        className="py-12"
      >
        <div className="max-w-6xl mx-auto py-8 px-2">
          <h1 className="text-4xl font-bold mb-2 text-red-700 tracking-wide drop-shadow">Our Brands</h1>
          <p className="text-lg mb-8 text-gray-800">
            Sunway Marketing only carries products of the highest quality, and to do that we partner with trusted brands that share our level of commitment and dedication. Here are some of them.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {brands.map((brand, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border-2 border-red-400 hover:shadow-xl transition"
                style={{
                  background: "linear-gradient(120deg, #fff 80%, #ffeaea 100%)",
                }}
              >
                <img
                  src={brand.img}
                  alt={brand.name}
                  className="w-36 h-36 object-contain rounded-full border-4 border-red-200 mb-4 shadow"
                  style={{ background: "#fff5f5" }}
                />
                <h2 className="font-bold text-lg text-red-700 mb-1 uppercase tracking-wider">{brand.name}</h2>
                <div className="text-gray-700 text-sm text-center">{brand.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
