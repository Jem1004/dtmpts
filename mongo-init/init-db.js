// MongoDB initialization script
// This script will run when the MongoDB container starts for the first time

// Switch to the application database
db = db.getSiblingDB('dpmptsp_db');

// Create collections
db.createCollection('users');
db.createCollection('beritas');
db.createCollection('galeris');
db.createCollection('laporans');

// Create indexes for better performance

// Users collection indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });

// Beritas (News) collection indexes
db.beritas.createIndex({ "slug": 1 }, { unique: true });
db.beritas.createIndex({ "published": 1 });
db.beritas.createIndex({ "createdAt": -1 });
db.beritas.createIndex({ "title": "text", "summary": "text", "content": "text" });

// Galeris (Gallery) collection indexes
db.galeris.createIndex({ "published": 1 });
db.galeris.createIndex({ "type": 1 });
db.galeris.createIndex({ "createdAt": -1 });
db.galeris.createIndex({ "title": "text", "description": "text" });

// Laporans (Reports) collection indexes
db.laporans.createIndex({ "status": 1 });
db.laporans.createIndex({ "createdAt": -1 });
db.laporans.createIndex({ "email": 1 });

// Create default admin user
db.users.insertOne({
  username: 'admin',
  email: 'admin@dpmptsp.go.id',
  password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'admin123'
  role: 'admin',
  createdAt: new Date(),
  updatedAt: new Date()
});

// Insert sample data

// Sample news articles
db.beritas.insertMany([
  {
    title: 'Peluncuran Sistem Pelayanan Online Terpadu',
    slug: 'peluncuran-sistem-pelayanan-online-terpadu',
    summary: 'DPMPTSP Kabupaten Penajam Paser Utara meluncurkan sistem pelayanan online untuk memudahkan masyarakat dalam mengurus perizinan.',
    content: '<p>Dalam rangka meningkatkan kualitas pelayanan publik, DPMPTSP Kabupaten Penajam Paser Utara dengan bangga meluncurkan sistem pelayanan online terpadu. Sistem ini memungkinkan masyarakat untuk mengajukan berbagai jenis perizinan secara online tanpa harus datang langsung ke kantor.</p><p>Kepala DPMPTSP menyampaikan bahwa sistem ini merupakan bagian dari transformasi digital yang bertujuan untuk memberikan kemudahan dan transparansi dalam pelayanan publik.</p>',
    imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
    published: true,
    viewCount: 125,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    title: 'Workshop Peningkatan Kapasitas UMKM',
    slug: 'workshop-peningkatan-kapasitas-umkm',
    summary: 'Kegiatan workshop untuk meningkatkan kapasitas dan daya saing UMKM di Kabupaten Penajam Paser Utara.',
    content: '<p>DPMPTSP Kabupaten Penajam Paser Utara mengadakan workshop peningkatan kapasitas UMKM yang diikuti oleh 50 pelaku usaha mikro, kecil, dan menengah dari berbagai sektor.</p><p>Workshop ini membahas strategi pemasaran digital, manajemen keuangan, dan cara mengakses program bantuan pemerintah untuk pengembangan usaha.</p>',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
    published: true,
    viewCount: 89,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  }
]);

// Sample gallery items
db.galeris.insertMany([
  {
    title: 'Kantor DPMPTSP Kabupaten Penajam Paser Utara',
    description: 'Gedung kantor DPMPTSP yang modern dan nyaman untuk melayani masyarakat.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
    type: 'photo',
    published: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    title: 'Pelayanan Terpadu Satu Pintu',
    description: 'Suasana pelayanan di loket PTSP yang efisien dan ramah.',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
    type: 'photo',
    published: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  }
]);

print('Database initialization completed successfully!');