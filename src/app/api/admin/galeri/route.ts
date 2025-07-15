import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Galeri from '@/models/Galeri';
import DOMPurify from 'isomorphic-dompurify';

// GET - Fetch all galeri for admin (including unpublished)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const type = searchParams.get('type'); // 'photo' or 'video'
    const search = searchParams.get('search') || '';
    const published = searchParams.get('published');

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (type && ['photo', 'video'].includes(type)) {
      query.type = type;
    }
    if (published !== null && published !== undefined && published !== '') {
      query.published = published === 'true';
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Fetch galeri with pagination
    const galeri = await Galeri.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Galeri.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get type and publication stats
    const photoCount = await Galeri.countDocuments({ type: 'photo', published: true });
    const videoCount = await Galeri.countDocuments({ type: 'video', published: true });
    const publishedCount = await Galeri.countDocuments({ published: true });
    const unpublishedCount = await Galeri.countDocuments({ published: false });

    return NextResponse.json({
      success: true,
      galeri,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      stats: {
        photo: photoCount,
        video: videoCount,
        published: publishedCount,
        unpublished: unpublishedCount,
        total: publishedCount + unpublishedCount,
      },
    });
  } catch (error) {
    console.error('Error fetching galeri:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch galeri' },
      { status: 500 }
    );
  }
}

// POST - Create new galeri item (Admin only)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { title, description, image_url, type = 'photo', published = true } = body;

    // Validate required fields
    if (!title || !description || !image_url) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['photo', 'video'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Must be photo or video' },
        { status: 400 }
      );
    }

    // Sanitize content
    const sanitizedDescription = DOMPurify.sanitize(description);

    // Create new galeri item
    const galeri = new Galeri({
      title: title.trim(),
      description: sanitizedDescription,
      image_url,
      type,
      published,
    });

    await galeri.save();

    return NextResponse.json(
      { 
        success: true, 
        galeri,
        message: 'Item galeri berhasil dibuat'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating galeri:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create galeri item' },
      { status: 500 }
    );
  }
}