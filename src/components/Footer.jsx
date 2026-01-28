// src/components/Footer.jsx
import React from 'react';
import { BookOpen, MapPin, Mail, Phone, Facebook, Twitter, Linkedin, Youtube, Instagram } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: "#", label: "Facebook" },
    { icon: <Twitter className="w-5 h-5" />, href: "#", label: "Twitter" },
    { icon: <Linkedin className="w-5 h-5" />, href: "#", label: "LinkedIn" },
    { icon: <Youtube className="w-5 h-5" />, href: "#", label: "YouTube" },
    { icon: <Instagram className="w-5 h-5" />, href: "#", label: "Instagram" },
  ];

  const quickLinks = [
    { name: "มาตรฐานและตัวบ่งชี้", href: "#" },
    { name: "กระบวนการประเมิน", href: "#" },
    { name: "รายงานและเอกสาร", href: "#" },
    { name: "ผลการประเมิน", href: "#" },
    { name: "ข่าวสารและกิจกรรม", href: "#" },
    { name: "ติดต่อเรา", href: "#" },
  ];

  const services = [
    { name: "การประเมินภายใน", href: "#" },
    { name: "การประเมินภายนอก", href: "#" },
    { name: "การพัฒนาหลักสูตร", href: "#" },
    { name: "การอบรมและสัมมนา", href: "#" },
    { name: "การให้คำปรึกษา", href: "#" },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* University Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-600 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">
                  มหาวิทยาลัยเทคโนโลยีราชมงคลศรีวิชัย
                </h3>
                <p className="text-xs text-gray-400">Rajamangala University of Technology Srivijaya</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              แพลตฟอร์มสนับสนุนการประเมินคุณภาพ AUN-QA เพื่อการพัฒนาอย่างต่อเนื่องของคณะ/สาขา มุ่งมั่นสร้างคุณภาพการศึกษาที่ยอดเยี่ยม
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-gray-700 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-110"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">ลิงก์ด่วน</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">บริการ</h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <a 
                    href={service.href}
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">ติดต่อเรา</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-300 font-medium">ที่อยู่</p>
                  <p className="text-sm text-gray-400">
                    1 ถ.ราชมงคลสงขลา ต.บ่อยาง อ.เมือง จ.สงขลา 90000
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <a 
                  href="mailto:info@rmutsv.ac.th" 
                  className="text-sm text-gray-300 hover:text-blue-400 transition-colors"
                >
                  info@rmutsv.ac.th
                </a>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-blue-400" />
                </div>
                <a 
                  href="tel:+6674317100" 
                  className="text-sm text-gray-300 hover:text-blue-400 transition-colors"
                >
                  +66 74 317 100
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400">
                &copy; {currentYear} มหาวิทยาลัยเทคโนโลยีราชมงคลศรีวิชัย วิทยาเขตสงขลา. สงวนลิขสิทธิ์.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                พัฒนาโดย คณะกรรมการประกันคุณภาพภายในสถาบัน
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-blue-400 transition-colors">นโยบายความเป็นส่วนตัว</a>
              <a href="#" className="hover:text-blue-400 transition-colors">เงื่อนไขการใช้งาน</a>
              <a href="#" className="hover:text-blue-400 transition-colors">แผนผังเว็บไซต์</a>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent pointer-events-none"></div>
    </footer>
  );
}