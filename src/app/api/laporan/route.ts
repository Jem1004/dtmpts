import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Laporan from '@/models/Laporan';
import DOMPurify from 'isomorphic-dompurify';

// GET - Fetch all laporan with pagination (Admin only)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (status && ['pending', 'in_progress', 'resolved', 'closed'].includes(status)) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { nama: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    // Fetch laporan with pagination
    const laporan = await Laporan.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Laporan.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get status counts
    const statusCounts = await Laporan.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusStats = {
      pending: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    };

    statusCounts.forEach((item) => {
      statusStats[item._id as keyof typeof statusStats] = item.count;
    });

    return NextResponse.json({
      success: true,
      laporan,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      statusStats,
    });
  } catch (error) {
    console.error('Error fetching laporan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch laporan' },
      { status: 500 }
    );
  }
}

// POST - Create new laporan (Public)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { nama, email, phone, address, message } = body;

    // Validate required fields
    if (!nama || !email || !phone || !address || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Sanitize content
    const sanitizedMessage = DOMPurify.sanitize(message);
    const sanitizedAddress = DOMPurify.sanitize(address);

    // Create new laporan
    const laporan = new Laporan({
      nama: nama.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: sanitizedAddress,
      message: sanitizedMessage,
      status: 'pending',
    });

    await laporan.save();

    return NextResponse.json(
      { 
        success: true, 
        message: 'Laporan berhasil dikirim. Terima kasih atas partisipasi Anda.',
        laporan: {
          _id: laporan._id,
          nama: laporan.nama,
          created_at: laporan.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating laporan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit laporan' },
      { status: 500 }
    );
  }
}