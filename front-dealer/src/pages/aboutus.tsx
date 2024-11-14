import Navbar from '../components/header/navbar';
import Sidebar from '../components/header/sidebar';
import React from 'react';
import { motion } from 'framer-motion';

const AboutUs = () => {
  // Define animation properties
  const animationVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 1, ease: 'easeOut' } },
  };

  return (
    <>
      <Navbar />
      <div className="flex">
        <div className="flex-1 p-6 bg-gray-100">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={animationVariants}
            className="bg-white p-8 shadow-lg rounded-lg"
          >
            <h1 className="text-3xl font-bold mb-4">About Us</h1>
            <p className="text-lg leading-relaxed mb-6">
              <strong>PT SUNWAY TREK MASINDO</strong> is a subsidiary of the Malaysia Listed Company, Sunway Berhad. We engage in trading a wide range of aftermarket heavy equipment, including Undercarriage Parts, Engine Parts, Ground Engaging Tools, Hydraulic & Industrial Hoses, and Heavy Equipment. We operate with eight branches and warehouses throughout Indonesia.
            </p>
            <p className="text-lg leading-relaxed mb-6">
              We are the leading aftermarket distributor of crawler track undercarriage parts. Our brands DCFTREK and SUNTRAK are widely accepted with years of great market reputation, covering all major models of bulldozers and excavators. We offer a comprehensive range of aftermarket parts for Excavators and Bulldozers, such as DCF TREK Undercarriage Parts, Suntrak Ground Engaging Tools, and related parts to our end users.
            </p>
            <p className="text-lg leading-relaxed mb-6">
              We are also a one-stop provider of <strong>SUNFLEX</strong> Hydraulic & Industrial hoses, fittings, couplings, tubes, and accessories for all industries. The SUNFLEX brand, with its proven track record in quality, offers excellent pre- and post-sales services in the Asia-Pacific region.
            </p>
            <p className="text-lg leading-relaxed">
              For Heavy Equipment, we distribute <strong>Airman Compressors</strong>, <strong>Airman Generator Sets</strong>, and XCMG concrete pump products, including Truck Mounted Pumps, Trailer Pumps, Mixer Trucks, and Drilling Rigs.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AboutUs;
