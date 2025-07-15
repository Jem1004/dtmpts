# MongoDB Docker Setup untuk DPMPTSP Website

Panduan ini menjelaskan cara menginstall dan menjalankan MongoDB menggunakan Docker untuk project website DPMPTSP Kabupaten Penajam Paser Utara.

## Prerequisites

- Docker Desktop terinstall di sistem Anda
- Docker Compose (biasanya sudah termasuk dengan Docker Desktop)

## Instalasi dan Setup

### 1. Menjalankan MongoDB Container

Jalankan perintah berikut di root directory project:

```bash
# Menjalankan MongoDB dan Mongo Express
docker-compose up -d
```

### 2. Verifikasi Container Berjalan

```bash
# Cek status container
docker-compose ps

# Atau cek dengan docker ps
docker ps
```

Anda harus melihat 2 container berjalan:
- `dpmptsp-mongodb` (MongoDB server)
- `dpmptsp-mongo-express` (MongoDB web interface)

### 3. Akses MongoDB

#### MongoDB Connection
- **Host**: localhost
- **Port**: 27018
- **Database**: dpmptsp_db
- **Username**: admin
- **Password**: password123
- **Connection String**: `mongodb://admin:password123@localhost:27018/dpmptsp_db?authSource=admin`

#### Mongo Express (Web Interface)
- **URL**: http://localhost:8081
- **Username**: admin
- **Password**: admin123

### 4. Menjalankan Aplikasi Next.js

Setelah MongoDB container berjalan, jalankan aplikasi:

```bash
npm run dev
```

Aplikasi akan tersedia di http://localhost:3000

## Data Awal

Container MongoDB akan otomatis membuat:
- Database `dpmptsp_db`
- Collections: `users`, `beritas`, `galeris`, `laporans`
- Indexes untuk performa optimal
- User admin default:
  - Username: `admin`
  - Email: `admin@dpmptsp.go.id`
  - Password: `admin123`
- Sample data untuk news dan gallery

## Perintah Docker Berguna

### Menghentikan Container
```bash
docker-compose down
```

### Menghentikan dan Menghapus Volume (Data akan hilang)
```bash
docker-compose down -v
```

### Melihat Logs
```bash
# Logs semua services
docker-compose logs

# Logs MongoDB saja
docker-compose logs mongodb

# Logs dengan follow mode
docker-compose logs -f
```

### Restart Container
```bash
docker-compose restart
```

### Masuk ke MongoDB Shell
```bash
docker exec -it dpmptsp-mongodb mongosh -u admin -p password123 --authenticationDatabase admin
```

## Backup dan Restore

### Backup Database
```bash
docker exec dpmptsp-mongodb mongodump -u admin -p password123 --authenticationDatabase admin --db dpmptsp_db --out /data/backup
```

### Restore Database
```bash
docker exec dpmptsp-mongodb mongorestore -u admin -p password123 --authenticationDatabase admin --db dpmptsp_db /data/backup/dpmptsp_db
```

## Troubleshooting

### Container Tidak Bisa Start
1. Pastikan port 27017 dan 8081 tidak digunakan aplikasi lain
2. Cek logs: `docker-compose logs`
3. Restart Docker Desktop

### Koneksi Database Gagal
1. Pastikan container MongoDB berjalan: `docker ps`
2. Cek environment variables di `.env.local`
3. Pastikan connection string benar

### Reset Database
Jika ingin reset database ke kondisi awal:
```bash
docker-compose down -v
docker-compose up -d
```

## Security Notes

⚠️ **PENTING**: Credentials default ini hanya untuk development. Untuk production:
1. Ganti username dan password MongoDB
2. Ganti password Mongo Express
3. Update connection string di `.env.local`
4. Gunakan environment variables yang aman

## Struktur File

```
├── docker-compose.yml          # Konfigurasi Docker services
├── mongo-init/
│   └── init-db.js              # Script inisialisasi database
├── .env.local                  # Environment variables (updated)
└── README-DOCKER.md            # Dokumentasi ini
```