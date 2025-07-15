import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Galeri from '@/models/Galeri';
import DOMPurify from 'isomorphic-dompurify';

// GET - Fetch all galeri with pagination
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const type = searchParams.get('type'); // 'photo' or 'video'
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = { published: true };
    if (type && ['photo', 'video'].includes(type)) {
      query.type = type;
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
      { success: true, galeri },
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