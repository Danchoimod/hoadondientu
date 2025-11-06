'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

export default function Home() {
  const [activeTab, setActiveTab] = useState('invoice');
  const [taxCode, setTaxCode] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const invoiceData = {
    domain: 'danhoabridal.com',
    previewUrl: 'https://danhoabridal.vercel.app',
    status: 'Chưa thanh toán',
    items: [
      { name: 'Trang chủ', complexity: 'Trung bình–cao', description: 'Giao diện chính, có banner, danh mục, sản phẩm nổi bật, footer...', price: 100000 },
      { name: 'Trang chi tiết sản phẩm', complexity: 'Trung bình', description: 'Hiển thị thông tin 1 sản phẩm, hình ảnh, mô tả, giá, nút mua', price: 90000 },
      { name: 'Trang giới thiệu', complexity: 'Đơn giản', description: 'Nội dung tĩnh, giới thiệu doanh nghiệp hoặc sản phẩm', price: 20000 },
      { name: 'Trang danh mục', complexity: 'Trung bình', description: 'Liệt kê sản phẩm theo danh mục, có lọc/sắp xếp', price: 70000 },
      { name: 'Trang quản lý danh mục (Admin)', complexity: 'Trung bình', description: 'CRUD danh mục: thêm/sửa/xóa', price: 70000 },
      { name: 'Trang quản lý sản phẩm (Admin)', complexity: 'Cao', description: 'CRUD sản phẩm, upload ảnh, mô tả...', price: 100000 },
      { name: 'Trang quản lý carousel (Admin)', complexity: 'Đơn giản', description: 'Upload, thay đổi ảnh slide', price: 50000 },
      { name: 'Tên miền', complexity: '', description: 'Tên miền mua ở Inet', price: 229000 },
      { name: 'Chứng chỉ SSL', complexity: '', description: 'Chứng chỉ mua ở Inet', price: 180000 },
      { name: 'Hosting', complexity: '', description: '', price: 0, note: 'Miễn phí' },
      { name: 'Máy chủ + CSDL', complexity: '', description: '', price: 0, note: 'Miễn phí' },
      { name: 'Image Cloud', complexity: '', description: '', price: 0, note: 'Miễn phí' },
    ],
    total: 909000,
    qrCode: '/qrcode.jpg', // Sử dụng ảnh QR từ thư mục public
    bankInfo: {
      bank: 'VietQR - Napas 247',
      accountNumber: '9395473223',
      accountName: 'VCB Bank',
      amount: 909000
    }
  };

  const handleSearch = () => {
    // Kiểm tra nếu tên miền và mã bảo mật đúng
    if (taxCode.toLowerCase() === 'danhoabridal.com' && invoiceNumber === '101125') {
      setShowResult(true);
      setShowPayment(false);
      // Lấy trạng thái thanh toán từ Firestore
      checkPaymentStatus();
    } else {
      alert('Không tìm thấy thông tin hóa đơn!');
      setShowResult(false);
    }
  };

  const checkPaymentStatus = async () => {
    setIsLoading(true);
    try {
      const docRef = doc(db, 'info', 'info');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const status = docSnap.data().status;
        setPaymentStatus(status);
        
        // Nếu đã thanh toán, hiển thị modal ngay
        if (status === 1) {
          setShowSuccessModal(true);
        }
        
        // Lắng nghe thay đổi real-time
        const unsubscribe = onSnapshot(docRef, (doc) => {
          if (doc.exists()) {
            const newStatus = doc.data().status;
            const previousStatus = paymentStatus;
            setPaymentStatus(newStatus);
            
            // Nếu status chuyển từ 0 sang 1, hiển thị modal thành công
            if (newStatus === 1 && previousStatus !== 1) {
              setShowSuccessModal(true);
            }
          }
        });
        
        // Cleanup function
        return () => unsubscribe();
      }
    } catch (error) {
      console.error('Error fetching payment status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto close modal after 3 seconds
  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000); // 3 seconds

      return () => clearTimeout(timer);
    }
  }, [showSuccessModal]);

  const handlePayment = () => {
    setShowPayment(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Update invoice data status based on Firebase
  const currentStatus = paymentStatus === 1 ? 'Đã thanh toán' : 'chờ thanh toán';

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-white text-gray-900' : 'bg-white'} shadow-sm sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="text-lg sm:text-xl font-bold text-blue-600">invoice</span>
                <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">GIẢI PHÁP HÓA ĐƠN ĐIỆN TỬ</span>
              </div>
            </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4 lg:gap-8">
              <a href="#" className="text-xs lg:text-sm text-gray-700 hover:text-blue-600 whitespace-nowrap">
                Kiểm tra hóa đơn
              </a>
            </nav>


          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden px-4 sm:px-6 lg:px-8 pb-4 border-t border-gray-200">
              <nav className="flex flex-col gap-3 pt-4">
                <a href="#" className="text-sm text-gray-700 hover:text-blue-600 py-2">
                  Kiểm tra hóa đơn hợp lệ
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Add padding top to account for fixed header */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-6 sm:pb-8 lg:pb-12">
        {/* Title */}
        <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
          Hệ thống tra cứu hóa đơn điện tử
        </h1>
        <p className={`text-sm sm:text-base text-center mb-6 sm:mb-8 lg:mb-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Nhanh chóng • Chính xác • An toàn
        </p>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Panel - Search Form */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 sm:p-6 lg:p-8`}>
            <h2 className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Thông tin tra cứu
            </h2>

            {/* Tabs - Scrollable on Mobile */}
            <div className="overflow-x-auto -mx-4 sm:mx-0 mb-6">
              <div className="flex gap-1 sm:gap-2 md:gap-4 px-4 sm:px-0 border-b border-gray-200 min-w-max sm:min-w-0">
                <button
                  onClick={() => setActiveTab('invoice')}
                  className={`pb-2 sm:pb-3 px-1.5 sm:px-2 md:px-4 font-medium text-xs sm:text-sm md:text-base whitespace-nowrap ${
                    activeTab === 'invoice'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Hóa đơn
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  tên miền <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={taxCode}
                  onChange={(e) => setTaxCode(e.target.value)}
                  placeholder="Nhập tên miền"
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 placeholder-gray-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Số báo mật <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Nhập số bảo mật"
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 placeholder-gray-400'
                  }`}
                />
              </div>

              <button
                onClick={handleSearch}
                className="w-full py-2.5 sm:py-3 md:py-3.5 mt-2 sm:mt-3 bg-blue-600 text-white text-sm sm:text-base rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
              >
                Tra cứu
              </button>
            </div>
          </div>

          {/* Right Panel - Instructions or Results */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 sm:p-6 lg:p-8`}>
            {!showResult ? (
              <>
                <h2 className={`text-lg sm:text-xl font-semibold mb-4 sm:mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Hướng dẫn tra cứu hóa đơn điện tử
                </h2>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <strong>Bước 1:</strong> Nhập <em>Tên miền</em> của hóa đơn cần tra cứu vào ô tương ứng.
                    </p>
                  </div>

                  <div>
                    <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <strong>Bước 2:</strong> Nhập <em>Số báo mật</em> và nhấn vào nút <strong>Tra cứu</strong>.
                    </p>
                  </div>

                  <div>
                    <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <strong>Bước 3:</strong> Màn hình sẽ hiển thị thông tin chi tiết về hóa đơn, bạn có thể tùy chọn thanh toán.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <h2 className={`text-lg sm:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Thông tin hóa đơn
                </h2>
                
                <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <div className="grid grid-cols-2 gap-2 text-sm sm:text-base">
                    <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Tên trang web:</div>
                    <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{invoiceData.domain}</div>
                    <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Xem trước:</div>
                    <a 
                      href={invoiceData.previewUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
                    >
                      {invoiceData.previewUrl.replace('https://', '')}
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Trạng thái thanh toán:</div>
                    <div className={`font-semibold ${paymentStatus === 1 ? 'text-green-600' : 'text-red-600'}`}>
                      {isLoading ? 'Đang tải...' : currentStatus}
                    </div>
                  </div>
                </div>

                {!showPayment ? (
                  <>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <div className="inline-block min-w-full px-4 sm:px-0">
                        <table className="min-w-full text-xs sm:text-sm">
                          <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <tr>
                              <th className={`px-2 sm:px-4 py-2 text-left font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Trang / Chức năng</th>
                              <th className={`px-2 sm:px-4 py-2 text-left font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Mức độ</th>
                              <th className={`px-2 sm:px-4 py-2 text-left font-semibold hidden sm:table-cell ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Mô tả</th>
                              <th className={`px-2 sm:px-4 py-2 text-right font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Tiền công</th>
                              <th className={`px-2 sm:px-4 py-2 text-right font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}></th>
                            </tr>
                          </thead>
                          <tbody className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {invoiceData.items.map((item, index) => (
                              <tr key={index} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <td className="px-2 sm:px-4 py-2">{item.name}</td>
                                <td className="px-2 sm:px-4 py-2">{item.complexity}</td>
                                <td className="px-2 sm:px-4 py-2 hidden sm:table-cell text-xs">{item.description}</td>
                                <td className="px-2 sm:px-4 py-2 text-right whitespace-nowrap">
                                  {item.note || formatCurrency(item.price)}
                                </td>
                              </tr>
                            ))}
                            <tr className={`font-bold ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              <td colSpan={3} className="px-2 sm:px-4 py-3 text-right">Tổng tiền:</td>
                              <td className="px-2 sm:px-4 py-3 text-right text-blue-600">{formatCurrency(invoiceData.total)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Hiển thị nút thanh toán chỉ khi chưa thanh toán (status !== 1) */}
                    {paymentStatus !== 1 && (
                      <button
                        onClick={handlePayment}
                        className="w-full py-2.5 sm:py-3 bg-green-600 text-white text-sm sm:text-base rounded-lg font-medium hover:bg-green-700 active:bg-green-800 transition-colors"
                      >
                        Thanh toán
                      </button>
                    )}

                    {/* Hiển thị thông báo nếu đã thanh toán */}
                    {paymentStatus === 1 && (
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20 border border-green-500' : 'bg-green-50 border-2 border-green-500'} text-center`}>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <p className={`font-semibold text-green-600`}>
                            Đã thanh toán thành công!
                          </p>
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                          Tên miền sẽ được tải lên sau 24 giờ
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                    <div className="space-y-4">
                    <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Thông tin thanh toán
                    </h3>
                    
                    <div className="flex flex-col items-center gap-4">
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white border-2 border-gray-200'}`}>
                        <Image 
                          id="qr-code-image"
                          src={invoiceData.qrCode} 
                          alt="VietQR Payment Code" 
                          width={280}
                          height={280}
                          className="w-60 h-60 sm:w-70 sm:h-70 object-contain"
                          priority
                        />
                      </div>
                      
                      {/* Nút lưu mã QR */}
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = invoiceData.qrCode;
                          link.download = `QR_${invoiceData.domain}_${formatCurrency(invoiceData.total)}.jpg`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Lưu mã QR
                      </button>                      <div className={`w-full p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} space-y-2 text-sm sm:text-base`}>
                        <div className="text-center mb-3">
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Quét mã QR để thanh toán qua VietQR - Napas 247
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Ngân hàng:</span>
                          <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{invoiceData.bankInfo.accountName}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Số tài khoản:</span>
                          <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{invoiceData.bankInfo.accountNumber}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Phương thức:</span>
                          <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{invoiceData.bankInfo.bank}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Số tiền:</span>
                          <span className="font-semibold text-blue-600">{formatCurrency(invoiceData.bankInfo.amount)}</span>
                        </div>
                        <div className="pt-2 border-t border-gray-300">
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Nội dung: Thanh toan {invoiceData.domain}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowPayment(false)}
                        className="w-full py-2.5 bg-gray-600 text-white text-sm sm:text-base rounded-lg font-medium hover:bg-gray-700 transition-colors"
                      >
                        Quay lại
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full transform transition-all animate-scaleIn`}>
            <div className="text-center space-y-4">
              {/* Animated Checkmark */}
              <div className="flex justify-center">
                <div className="relative animate-zoomIn">
                  <svg className="w-24 h-24" viewBox="0 0 100 100">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="#10B981" 
                      strokeWidth="4"
                      className="animate-drawCircle"
                      style={{
                        strokeDasharray: '283',
                        strokeDashoffset: '283',
                        animation: 'drawCircle 0.6s ease-out forwards'
                      }}
                    />
                    <path 
                      d="M 30 50 L 45 65 L 70 35" 
                      fill="none" 
                      stroke="#10B981" 
                      strokeWidth="6" 
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-drawCheck"
                      style={{
                        strokeDasharray: '60',
                        strokeDashoffset: '60',
                        animation: 'drawCheck 0.4s ease-out 0.6s forwards'
                      }}
                    />
                  </svg>
                </div>
              </div>

              <h2 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} animate-slideUp`}>
                Thanh toán thành công! 🎉
              </h2>

              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'} animate-slideUp`} style={{ animationDelay: '0.2s' }}>
                <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tên miền: <span className="font-bold text-green-600">{invoiceData.domain}</span>
                </p>
                <p className={`text-sm sm:text-base mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Số tiền: <span className="font-bold text-green-600">{formatCurrency(invoiceData.total)}</span>
                </p>
              </div>

              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-500' : 'bg-blue-50 border border-blue-200'} animate-slideUp`} style={{ animationDelay: '0.4s' }}>
                <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                  ⏰ Tên miền sẽ được tải lên sau <strong>24 giờ</strong>
                </p>
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Vui lòng chờ đợi, chúng tôi sẽ thông báo khi hoàn tất!
                </p>
              </div>

              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} animate-pulse`}>
                Modal sẽ tự động đóng sau 3 giây...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
