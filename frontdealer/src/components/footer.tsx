import React from "react";

const Footer: React.FC = () => (
  <footer className="border-t mt-8 pt-6 bg-white/80">
    <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 px-6 pb-4 text-sm">
      <div>
        <h4 className="text-red-700 font-bold mb-2">Our Products</h4>
        <ul>
          <li><a href="http://sunflex.com.sg/products/categories/hoses" className="hover:text-red-600">Hoses</a></li>
          <li><a href="http://sunflex.com.sg/products/categories/sunflex-catalogue" className="hover:text-red-600">Product Catalogue</a></li>
          <li><a href="http://sunflex.com.sg/products/categories/instrumentation" className="hover:text-red-600">Instrumentation</a></li>
          <li><a href="http://sunflex.com.sg/products/categories/fittings" className="hover:text-red-600">Fittings & Accessories</a></li>
          <li><a href="http://sunflex.com.sg/products/categories/machinery-heavy-equipment" className="hover:text-red-600">Machinery</a></li>
          <li><a href="http://sunflex.com.sg/products/categories/material-handling" className="hover:text-red-600">BYD</a></li>
          <li><a href="http://sunflex.com.sg/products/categories/case-constructions-products" className="hover:text-red-600">CASE</a></li>
          <li><a href="http://sunflex.com.sg/products/categories/airman-generator" className="hover:text-red-600">AIRMAN</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-red-700 font-bold mb-2">About Us</h4>
        <ul>
          <li><a href="http://sunflex.com.sg/about-us/our-profile" className="hover:text-red-600">Our Profile</a></li>
          <li><a href="http://sunflex.com.sg/about-us/our-reach" className="hover:text-red-600">Our Reach</a></li>
          <li><a href="http://sunflex.com.sg/about-us/our-certificates" className="hover:text-red-600">Certificates</a></li>
          <li><a href="http://sunflex.com.sg/about-us/our-activities" className="hover:text-red-600">Our Activities</a></li>
          <li><a href="http://sunflex.com.sg/about-us/quality-policy" className="hover:text-red-600">Quality Policy</a></li>
          <li><a href="http://sunflex.com.sg/about-us/vision-mission-statement" className="hover:text-red-600">Vision & Mission Statement</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-red-700 font-bold mb-2">News & Media</h4>
        <ul>
          <li><a href="http://sunflex.com.sg/news/news-events" className="hover:text-red-600">News & Events</a></li>
          <li><a href="http://sunflex.com.sg/news/photo-gallery" className="hover:text-red-600">Photo Gallery</a></li>
          <li><a href="http://sunflex.com.sg/news/video-gallery-1" className="hover:text-red-600">Video Gallery</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-red-700 font-bold mb-2">Our Brands</h4>
        <ul>
          <li><a href="http://sunflex.com.sg/brands" className="hover:text-red-600">Our Brands</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-red-700 font-bold mb-2">Contact Us</h4>
        <p>
          Main Office : 19 Senoko South Road Singapore 758078<br />
          Telephone : +65 6758 5454<br />
          Facsimile : +65 6257 8759<br />
          <br />
          Branch : 11 Gul Street 4 Singapore 629240<br />
          Telephone : +65 6631 9968<br />
          Facsimile : +65 6257 8759
        </p>
        <ul>
          <li><a href="http://sunflex.com.sg/contact-us/our-offices" className="hover:text-red-600">Our Offices</a></li>
          <li><a href="http://sunflex.com.sg/contact-us/byd-enquiry" className="hover:text-red-600">BYD (Division)</a></li>
          <li><a href="http://sunflex.com.sg/contact-us/enquiry-and-feedback" className="hover:text-red-600">Enquiry and Feedback</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-6 py-4 text-xs text-gray-500 flex items-center justify-between border-t border-gray-200">
      <div>&copy; 2025 Sunway Marketing (S) Pte Ltd.</div>
    </div>
  </footer>
);

export default Footer;
