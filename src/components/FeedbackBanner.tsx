import Link from 'next/link';

const FeedbackBanner = () => {
  return (
    <section className="relative py-16 bg-gradient-to-r from-primary to-secondary overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
      </div>

      {/* Content */}
      <div className="relative container-custom">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          {/* Text Content */}
          <div className="text-white mb-8 lg:mb-0 lg:mr-8 text-center lg:text-left">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
              Kirim Aduan Umpan Balik anda lewat tombol disamping
            </h2>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl">
              Kami menghargai setiap masukan dan keluhan Anda untuk meningkatkan kualitas pelayanan kami.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex-shrink-0">
            <Link
              href="/kontak"
              className="group inline-flex items-center px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <svg 
                className="w-6 h-6 mr-3 group-hover:animate-pulse" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                />
              </svg>
              Pengaduan
              <svg 
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 8l4 4m0 0l-4 4m4-4H3" 
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-2">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">Respon Cepat</span>
            </div>
            <p className="text-white/80 text-sm">
              Kami akan merespon aduan Anda dalam 1x24 jam
            </p>
          </div>

          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-2">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">Terpercaya</span>
            </div>
            <p className="text-white/80 text-sm">
              Data Anda aman dan akan ditangani dengan profesional
            </p>
          </div>

          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-2">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-semibold">Mudah & Gratis</span>
            </div>
            <p className="text-white/80 text-sm">
              Proses pengaduan mudah dan tidak dikenakan biaya
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
    </section>
  );
};

export default FeedbackBanner;