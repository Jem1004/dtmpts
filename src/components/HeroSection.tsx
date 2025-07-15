import Link from 'next/link';

const HeroSection = () => {
  const ctaBoxes = [
    {
      title: 'Gaspol PPU',
      description: 'Aplikasi Perizinan Online',
      link: '/layanan/perizinan',
      icon: '📋',
    },
    {
      title: 'Bale Madukara PPU',
      description: 'Mall Pelayanan Publik',
      link: '/layanan/mpp',
      icon: '🏢',
    },
    {
      title: 'Investasi PPU',
      description: 'Investasi Penajam Paser Utara',
      link: '/data/statistik',
      icon: '💰',
    },
  ];

  const featureIcons = [
    {
      title: 'Layanan Perizinan Online',
      description: 'Gaspol adalah layanan Perizinan Online dari DPMPTSP PPU',
      link: '/layanan/perizinan',
      icon: '🌐',
    },
    {
      title: 'Monitoring Berkas',
      description: 'Monitoring perizinan Anda dengan mudah',
      link: '/layanan/monitoring',
      icon: '📊',
    },
    {
      title: 'Jenis dan Syarat Izin',
      description: 'Daftar jenis dan syarat izin dari DPMPTSP PPU',
      link: '/layanan/syarat-izin',
      icon: '📄',
    },
    {
      title: 'Regulasi',
      description: 'Daftar regulasi terkait layanan DPMPTSP PPU',
      link: '/layanan/regulasi',
      icon: '⚖️',
    },
  ];

  return (
    <section className="relative bg-gradient-to-br from-primary to-secondary text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/10">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
      </div>
      
      <div className="relative container-custom py-20">
        {/* Hero Content */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            DPMPTSP Penajam Paser Utara
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
            Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu Kabupaten Penajam Paser Utara
          </p>
        </div>

        {/* CTA Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {ctaBoxes.map((box, index) => (
            <Link
              key={index}
              href={box.link}
              className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">{box.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{box.title}</h3>
                <p className="text-white/90">{box.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Feature Icons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureIcons.map((feature, index) => (
            <Link
              key={index}
              href={feature.link}
              className="group bg-white/5 backdrop-blur-sm rounded-lg p-6 hover:bg-white/10 transition-all duration-300"
            >
              <div className="text-center">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h4 className="font-semibold mb-2 group-hover:text-yellow-300 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-sm text-white/80 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-16 fill-white"
        >
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
          ></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
          ></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;