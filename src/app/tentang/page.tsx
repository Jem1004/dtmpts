'use client';

import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TentangPage = () => {
  const visiMisi = {
    visi: "Menjadi Dinas yang Profesional, Inovatif, dan Terpercaya dalam Memberikan Pelayanan Perizinan dan Non Perizinan yang Prima kepada Masyarakat.",
    misi: [
      "Memberikan pelayanan perizinan dan non perizinan yang cepat, mudah, transparan, dan akuntabel",
      "Meningkatkan kualitas sumber daya manusia yang profesional dan berintegritas",
      "Mengembangkan sistem pelayanan berbasis teknologi informasi",
      "Menciptakan iklim investasi yang kondusif untuk pertumbuhan ekonomi daerah",
      "Melakukan koordinasi dan sinkronisasi dengan instansi terkait",
      "Memberikan kepastian hukum dalam setiap pelayanan perizinan"
    ]
  };

  const strukturOrganisasi = [
    {
      nama: "Drs. H. Abdul Gafur Mas'ud, M.Si",
      jabatan: "Kepala Dinas",
      foto: "/images/kepala-dinas.jpg"
    },
    {
      nama: "Ir. Siti Aminah, M.T",
      jabatan: "Sekretaris Dinas",
      foto: "/images/sekretaris.jpg"
    },
    {
      nama: "Drs. Ahmad Fauzi, M.AP",
      jabatan: "Kepala Bidang Pelayanan Perizinan",
      foto: "/images/kabid-perizinan.jpg"
    },
    {
      nama: "Ir. Dewi Sartika, M.Si",
      jabatan: "Kepala Bidang Pengendalian dan Pengawasan",
      foto: "/images/kabid-pengawasan.jpg"
    }
  ];

  const tugasPokok = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "Pelayanan Perizinan",
      description: "Memberikan pelayanan perizinan berusaha dan non berusaha sesuai dengan kewenangan yang diberikan"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      title: "Pengendalian dan Pengawasan",
      description: "Melakukan pengendalian dan pengawasan terhadap pelaksanaan perizinan yang telah diterbitkan"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Koordinasi Antar Instansi",
      description: "Melakukan koordinasi dengan instansi terkait dalam rangka pelayanan perizinan terpadu"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Peningkatan Investasi",
      description: "Menciptakan iklim investasi yang kondusif untuk mendorong pertumbuhan ekonomi daerah"
    }
  ];

  const sejarah = {
    pembentukan: "2016",
    latar_belakang: "DPMPTSP Kabupaten Penajam Paser Utara dibentuk berdasarkan Peraturan Daerah Nomor 8 Tahun 2016 tentang Pembentukan dan Susunan Perangkat Daerah Kabupaten Penajam Paser Utara. Pembentukan dinas ini merupakan bagian dari reformasi birokrasi untuk meningkatkan kualitas pelayanan publik, khususnya dalam bidang perizinan dan penanaman modal.",
    perkembangan: "Sejak berdiri, DPMPTSP terus melakukan inovasi dalam pelayanan, termasuk penerapan sistem pelayanan online, penyederhanaan prosedur, dan peningkatan kualitas SDM. Berbagai penghargaan telah diraih sebagai bentuk pengakuan atas komitmen dalam memberikan pelayanan prima kepada masyarakat."
  };

  const fasilitas = [
    {
      nama: "Ruang Pelayanan Terpadu",
      deskripsi: "Ruang pelayanan yang nyaman dengan sistem antrian digital"
    },
    {
      nama: "Loket Informasi",
      deskripsi: "Menyediakan informasi lengkap tentang persyaratan dan prosedur perizinan"
    },
    {
      nama: "Ruang Tunggu",
      deskripsi: "Ruang tunggu yang nyaman dengan fasilitas WiFi gratis"
    },
    {
      nama: "Sistem Online",
      deskripsi: "Pelayanan perizinan online 24/7 melalui website resmi"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Tentang DPMPTSP
            </h1>
            <p className="text-xl text-primary-100">
              Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu Kabupaten Penajam Paser Utara
            </p>
          </div>
        </div>
      </section>

      {/* Sejarah Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Sejarah</h2>
              <div className="w-24 h-1 bg-primary mx-auto"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Pembentukan</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {sejarah.latar_belakang}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Perkembangan</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {sejarah.perkembangan}
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-primary/10 rounded-lg p-8 text-center">
                  <div className="text-6xl font-bold text-primary mb-4">{sejarah.pembentukan}</div>
                  <p className="text-gray-700 font-medium">Tahun Pembentukan DPMPTSP</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visi Misi Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Visi & Misi</h2>
              <div className="w-24 h-1 bg-primary mx-auto"></div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Visi */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Visi</h3>
                </div>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {visiMisi.visi}
                </p>
              </div>
              
              {/* Misi */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Misi</h3>
                </div>
                <ul className="space-y-3">
                  {visiMisi.misi.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <span className="text-primary text-sm font-semibold">{index + 1}</span>
                      </div>
                      <span className="text-gray-600 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tugas Pokok Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Tugas Pokok & Fungsi</h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                DPMPTSP memiliki tugas pokok menyelenggarakan urusan pemerintahan di bidang penanaman modal dan pelayanan perizinan terpadu satu pintu.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tugasPokok.map((tugas, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-300">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <div className="text-primary">{tugas.icon}</div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{tugas.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{tugas.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Struktur Organisasi Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Struktur Organisasi</h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Pimpinan dan struktur organisasi DPMPTSP Kabupaten Penajam Paser Utara.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {strukturOrganisasi.map((person, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="relative h-48 bg-gray-200">
                    <Image
                      src={person.foto}
                      alt={person.nama}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder-person.jpg';
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{person.nama}</h3>
                    <p className="text-primary font-medium text-sm">{person.jabatan}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Fasilitas Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Fasilitas Pelayanan</h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Fasilitas dan sarana yang tersedia untuk mendukung pelayanan prima kepada masyarakat.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {fasilitas.map((item, index) => (
                <div key={index} className="flex items-start p-6 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.nama}</h3>
                    <p className="text-gray-600">{item.deskripsi}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Hubungi Kami</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Alamat</h3>
                <p className="text-primary-100 text-center">
                  Jl. Jenderal Sudirman No. 1<br />
                  Penajam, Kabupaten Penajam Paser Utara<br />
                  Kalimantan Timur 76127
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Telepon</h3>
                <p className="text-primary-100">
                  (0542) 123456<br />
                  (0542) 123457
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Email</h3>
                <p className="text-primary-100">
                  info@dpmptsp.penajamuara.go.id<br />
                  pelayanan@dpmptsp.penajamuara.go.id
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TentangPage;