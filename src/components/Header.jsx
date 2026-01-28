// src/components/Header.jsx
import React, { useState } from 'react';
import { GraduationCap, Menu, X, LogOut, ChevronDown } from 'lucide-react';

export default function Header({ 
  isMenuOpen, setIsMenuOpen, activeTab, setActiveTab, 
  currentUser, handleLogout, setShowLogin, rolePermissions 
}) {
  const [logoOk, setLogoOk] = useState(true);
  const isManageFlowActive = activeTab === 'programs' || activeTab === 'manage';
  
  const navigation = [
    { name: 'เกี่ยวกับ', tab: 'about' },
    { name: 'จัดการองค์ประกอบ', tab: 'programs', active: isManageFlowActive },
    { name: 'สรุปผลการดำเนินการ', tab: 'summary' },
    { name: 'สรุปผลการประเมิน', tab: 'committee' },
    { name: 'รายงาน', tab: 'reports' },
    { name: 'ขั้นตอน', tab: 'process' },
    { name: 'ผลการดำเนินการ', tab: 'assessment' },
  ];

  if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'dev')) {
    navigation.push({ name: 'แดชบอร์ด', tab: 'dashboard' });
  }

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              {logoOk ? (
                <img
                  src="/src/image/rmutsv-logo.png"
                  alt="RMUTSV Logo"
                  className="w-8 h-8 object-contain"
                  onError={() => setLogoOk(false)}
                />
              ) : (
                <GraduationCap className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">มหาวิทยาลัยเทคโนโลยีราชมงคลศรีวิชัย</h1>
              <p className="text-xs text-gray-600 font-medium">ระบบประกันคุณภาพ AUN-QA</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <button 
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  (item.active ? item.active : activeTab === item.tab) 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>
          
          {/* User Section */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                    rolePermissions[currentUser.role_id]?.color || 'bg-gray-400'
                  }`}>
                    {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                    <div className="text-xs text-gray-500">{rolePermissions[currentUser.role_id]?.name || 'User'}</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowLogin(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
              >
                เข้าสู่ระบบ
              </button>
            )}
            
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 animate-in slide-in-from-top duration-200">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <button 
                  key={item.tab}
                  onClick={() => {
                    setActiveTab(item.tab);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    (item.active ? item.active : activeTab === item.tab) 
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              
              {currentUser && (
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="px-4 py-3 bg-gray-50 rounded-lg mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                        rolePermissions[currentUser.role_id]?.color || 'bg-gray-400'
                      }`}>
                        {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                        <div className="text-xs text-gray-500">{rolePermissions[currentUser.role_id]?.name || 'User'}</div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}