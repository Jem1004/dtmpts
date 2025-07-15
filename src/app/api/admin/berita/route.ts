import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Berita from '@/models/Berita';
import DOMPurify from 'isomorphic-dompurify';

// GET - Fetch all berita for admin (including unpublished)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const published = searchParams.get('published');

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (published !== null && published !== undefined && published !== '') {
      query.published = published === 'true';
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
      ];
    }

    // Fetch berita with pagination
    const berita = await Berita.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Berita.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get publication stats
    const publishedCount = await Berita.countDocuments({ published: true });
    const unpublishedCount = await Berita.countDocuments({ published: false });

    return NextResponse.json({
      success: true,
      berita,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      stats: {
        published: publishedCount,
        unpublished: unpublishedCount,
        total: publishedCount + unpublishedCount,
      },
    });
  } catch (error) {
    console.error('Error fetching berita:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch berita' },
      { status: 500 }
    );
  }
}

// POST - Create new berita (Admin only)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { title, summary, content, image_url, published = true } = body;

    // Validate required fields
    if (!title || !summary || !content || !image_url) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Sanitize content
    const sanitizedContent = DOMPurify.sanitize(content);
    const sanitizedSummary = DOMPurify.sanitize(summary);

    // Create new berita
    const berita = new Berita({
      title: title.trim(),
      summary: sanitizedSummary,
      content: sanitizedContent,
      image_url,
      published,
    });

    await berita.save();

    return NextResponse.json(
      { 
        success: true, 
        berita,
        message: 'Berita berhasil dibuat'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating berita:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create berita' },
      { status: 500 }
    );
  }
}