'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface LayananItem {
  id: string;
  kategori: string;
  nama: string;
  deskripsi: string;
  persyaratan: string[];
  waktu_proses: string;
  biaya: string;
  dasar_hukum: string;
  icon: React.ReactNode;
}

const LayananPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<LayananItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  const categories = [
    { id: 'semua', name: 'Semua Layanan', count: 0 },
    { id: 'perizinan-usaha', name: 'Perizinan Usaha', count: 0 },
    { id: 'perizinan-non-usaha', name: 'Perizinan Non Usaha', count: 0 },
    { id: 'penanaman-modal', name: 'Penanaman Modal', count: 0 },
    { id: 'pelayanan-umum', name: 'Pelayanan Umum', count: 0 }
  ];

  const layananData: LayananItem[] = [
    {
      id: '1',
      kategori: 'perizinan-usaha',
      nama: 'Izin Usaha Mikro dan Kecil (IUMK)',
      deskripsi: 'Izin untuk usaha mikro dan kecil dengan kriteria tertentu sesuai peraturan perundang-undangan.',
      persyaratan: [
        'Fotocopy KTP yang masih berlaku',
        'Fotocopy Kartu Keluarga',
        'Pas foto 3x4 sebanyak 2 lembar',
        'Surat keterangan domisili usaha',
        'Denah lokasi usaha',
        'Surat pernyataan tidak mengganggu lingkungan'
      ],
      waktu_proses: '3 hari kerja',
      biaya: 'Gratis',
      dasar_hukum: 'PP No. 7 Tahun 2021 tentang Kemudahan, Perlindungan, dan Pemberdayaan Koperasi dan UMKM',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: '2',
      kategori: 'perizinan-usaha',
      nama: 'Surat Izin Usaha Perdagangan (SIUP)',
      deskripsi: 'Izin yang diberikan kepada perusahaan untuk melaksanakan kegiatan usaha di bidang perdagangan.',
      persyaratan: [
        'Fotocopy KTP Penanggung Jawab/Direktur',
        'Fotocopy NPWP Perusahaan',
        'Fotocopy Akta Pendirian Perusahaan',
        'Fotocopy Pengesahan Kemenkumham',
        'Fotocopy Surat Keterangan Domisili Perusahaan',
        'Pas foto Penanggung Jawab 4x6 sebanyak 2 lembar',
        'Surat Pernyataan tidak akan mengganggu lingkungan'
      ],
      waktu_proses: '5 hari kerja',
      biaya: 'Rp 50.000',
      dasar_hukum: 'Permendag No. 46/M-DAG/PER/9/2009 tentang Penerbitan SIUP',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    {
      id: '3',
      kategori: 'perizinan-usaha',
      nama: 'Tanda Daftar Perusahaan (TDP)',
      deskripsi: 'Tanda bukti bahwa perusahaan telah melakukan pendaftaran sesuai dengan ketentuan peraturan perundang-undangan.',
      persyaratan: [
        'Fotocopy KTP Penanggung Jawab',
        'Fotocopy NPWP Perusahaan',
        'Fotocopy Akta Pendirian dan Perubahannya',
        'Fotocopy Pengesahan Kemenkumham',
        'Fotocopy SIUP',
        'Fotocopy Surat Keterangan Domisili',
        'Pas foto Penanggung Jawab 4x6 sebanyak 2 lembar'
      ],
      waktu_proses: '3 hari kerja',
      biaya: 'Rp 30.000',
      dasar_hukum: 'UU No. 3 Tahun 1982 tentang Wajib Daftar Perusahaan',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: '4',
      kategori: 'perizinan-non-usaha',
      nama: 'Izin Mendirikan Bangunan (IMB)',
      deskripsi: 'Izin yang diberikan kepada pemilik bangunan untuk membangun baru, mengubah, memperluas, mengurangi, dan/atau merawat bangunan.',
      persyaratan: [
        'Fotocopy KTP Pemohon',
        'Fotocopy Sertifikat/Bukti Kepemilikan Tanah',
        'Fotocopy SPPT PBB Tahun Terakhir',
        'Gambar Rencana Bangunan (Site Plan, Denah, Tampak, Potongan)',
        'Perhitungan Struktur (untuk bangunan bertingkat)',
        'Surat Pernyataan Kesanggupan Mematuhi Ketentuan Teknis',
        'Surat Kuasa (jika dikuasakan)'
      ],
      waktu_proses: '14 hari kerja',
      biaya: 'Sesuai tarif retribusi daerah',
      dasar_hukum: 'UU No. 28 Tahun 2002 tentang Bangunan Gedung',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: '5',
      kategori: 'perizinan-non-usaha',
      nama: 'Izin Gangguan (HO)',
      deskripsi: 'Izin yang diberikan kepada perusahaan, organisasi sosial atau perorangan untuk mendirikan/menjalankan usaha di suatu tempat.',
      persyaratan: [
        'Fotocopy KTP Penanggung Jawab',
        'Fotocopy Surat Keterangan Domisili',
        'Fotocopy IMB atau Surat Keterangan Bangunan',
        'Denah Lokasi Usaha',
        'Surat Pernyataan Tidak Mengganggu Lingkungan',
        'Surat Persetujuan Tetangga',
        'Pas foto 4x6 sebanyak 2 lembar'
      ],
      waktu_proses: '7 hari kerja',
      biaya: 'Rp 100.000',
      dasar_hukum: 'UU No. 23 Tahun 2014 tentang Pemerintahan Daerah',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    },
    {
      id: '6',
      kategori: 'penanaman-modal',
      nama: 'Izin Prinsip Penanaman Modal',
      deskripsi: 'Izin yang diberikan kepada penanam modal untuk melakukan persiapan investasi sebelum memperoleh izin usaha.',
      persyaratan: [
        'Proposal Investasi',
        'Fotocopy KTP/Paspor Penanam Modal',
        'Fotocopy NPWP',
        'Fotocopy Akta Pendirian Perusahaan (jika berbadan hukum)',
        'Surat Keterangan Domisili Perusahaan',
        'Studi Kelayakan Investasi',
        'Surat Pernyataan Kesanggupan Melaksanakan Investasi'
      ],
      waktu_proses: '10 hari kerja',
      biaya: 'Gratis',
      dasar_hukum: 'UU No. 25 Tahun 2007 tentang Penanaman Modal',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: '7',
      kategori: 'pelayanan-umum',
      nama: 'Surat Keterangan Domisili Usaha',
      deskripsi: 'Surat keterangan yang menyatakan bahwa suatu usaha berdomisili di wilayah tertentu.',
      persyaratan: [
        'Fotocopy KTP Pemohon',
        'Fotocopy Kartu Keluarga',
        'Surat Keterangan RT/RW',
        'Fotocopy Bukti Kepemilikan/Sewa Tempat Usaha',
        'Pas foto 3x4 sebanyak 2 lembar',
        'Denah Lokasi Usaha'
      ],
      waktu_proses: '2 hari kerja',
      biaya: 'Rp 25.000',
      dasar_hukum: 'Perda Kabupaten Penajam Paser Utara tentang Retribusi Pelayanan Administrasi',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: '8',
      kategori: 'pelayanan-umum',
      nama: 'Legalisir Dokumen',
      deskripsi: 'Pelayanan pengesahan dokumen yang dikeluarkan oleh DPMPTSP untuk keperluan administrasi.',
      persyaratan: [
        'Dokumen asli yang akan dilegalisir',
        'Fotocopy dokumen yang akan dilegalisir',
        'Fotocopy KTP Pemohon',
        'Surat Kuasa (jika dikuasakan)'
      ],
      waktu_proses: '1 hari kerja',
      biaya: 'Rp 5.000 per lembar',
      dasar_hukum: 'Perda Kabupaten Penajam Paser Utara tentang Retribusi Pelayanan Administrasi',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      )
    }
  ];

  // Update category counts
  categories.forEach(category => {
    if (category.id === 'semua') {
      category.count = layananData.length;
    } else {
      category.count = layananData.filter(item => item.kategori === category.id).length;
    }
  });

  const filteredLayanan = layananData.filter(item => {
    const matchesCategory = selectedCategory === 'semua' || item.kategori === selectedCategory;
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openModal = (service: LayananItem) => {
    setSelectedService(service);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedService(null);
    document.body.style.overflow = 'unset';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Layanan Perizinan
            </h1>
            <p className="text-xl text-primary-100">
              Berbagai layanan perizinan dan non perizinan yang tersedia di DPMPTSP Kabupaten Penajam Paser Utara.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Search Form */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari layanan perizinan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center ${
                    selectedCategory === category.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{category.name}</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    selectedCategory === category.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Results Info */}
          <div className="mb-8">
            <p className="text-gray-600">
              {searchTerm ? (
                <>Menampilkan {filteredLayanan.length} hasil untuk "{searchTerm}"</>
              ) : (
                <>Menampilkan {filteredLayanan.length} layanan {selectedCategory === 'semua' ? '' : getCategoryName(selectedCategory).toLowerCase()}</>
              )}
            </p>
          </div>

          {/* Services Grid */}
          {filteredLayanan.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {searchTerm ? 'Tidak ada hasil ditemukan' : 'Belum ada layanan'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? `Tidak ada layanan yang cocok dengan pencarian "${searchTerm}"`
                  : `Belum ada layanan dalam kategori ${getCategoryName(selectedCategory).toLowerCase()}.`
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('semua');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Lihat Semua Layanan
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLayanan.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer"
                  onClick={() => openModal(service)}
                >
                  <div className="p-6">
                    {/* Category Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {getCategoryName(service.kategori)}
                      </span>
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <div className="text-primary">{service.icon}</div>
                      </div>
                    </div>
                    
                    {/* Service Info */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {service.nama}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {service.deskripsi}
                    </p>
                    
                    {/* Quick Info */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Proses: {service.waktu_proses}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Biaya: {service.biaya}</span>
                      </div>
                    </div>
                    
                    {/* View Details Button */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className="text-primary text-sm font-medium hover:text-primary/80 transition-colors duration-200">
                        Lihat Detail →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Service Detail Modal */}
      {showModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[90vh]">
              {/* Header */}
              <div className="bg-primary text-white p-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <div className="text-white">{selectedService.icon}</div>
                  </div>
                  <div className="flex-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white mb-2">
                      {getCategoryName(selectedService.kategori)}
                    </span>
                    <h2 className="text-2xl font-bold mb-2">{selectedService.nama}</h2>
                    <p className="text-primary-100">{selectedService.deskripsi}</p>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Quick Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Layanan</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <span className="text-sm text-gray-500">Waktu Proses</span>
                            <p className="font-medium text-gray-900">{selectedService.waktu_proses}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <span className="text-sm text-gray-500">Biaya</span>
                            <p className="font-medium text-gray-900">{selectedService.biaya}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Dasar Hukum */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Dasar Hukum</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{selectedService.dasar_hukum}</p>
                    </div>
                  </div>
                  
                  {/* Right Column */}
                  <div>
                    {/* Persyaratan */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Persyaratan</h3>
                      <ul className="space-y-2">
                        {selectedService.persyaratan.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                              <span className="text-primary text-xs font-semibold">{index + 1}</span>
                            </div>
                            <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/kontak"
                      className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 text-center"
                    >
                      Ajukan Permohonan
                    </Link>
                    <button
                      onClick={closeModal}
                      className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Butuh Bantuan?</h2>
            <p className="text-xl text-primary-100 mb-8">
              Tim kami siap membantu Anda dalam proses perizinan. Hubungi kami untuk konsultasi gratis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/kontak"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Hubungi Kami
              </Link>
              <Link
                href="/tentang"
                className="inline-flex items-center px-6 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tentang Kami
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LayananPage;