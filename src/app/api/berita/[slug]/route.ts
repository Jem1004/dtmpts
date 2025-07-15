import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Berita from '@/models/Berita';
import DOMPurify from 'isomorphic-dompurify';

// GET - Fetch single berita by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect();

    const berita = await Berita.findOne({ 
      slug: params.slug, 
      published: true 
    });

    if (!berita) {
      return NextResponse.json(
        { success: false, error: 'Berita not found' },
        { status: 404 }
      );
    }

    // Increment views
    await Berita.findByIdAndUpdate(berita._id, { $inc: { views: 1 } });

    return NextResponse.json({
      success: true,
      berita,
    });
  } catch (error) {
    console.error('Error fetching berita:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch berita' },
      { status: 500 }
    );
  }
}

// PUT - Update berita by slug (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect();

    const body = await request.json();
    const { title, summary, content, image_url, published } = body;

    // Find berita by slug
    const berita = await Berita.findOne({ slug: params.slug });

    if (!berita) {
      return NextResponse.json(
        { success: false, error: 'Berita not found' },
        { status: 404 }
      );
    }

    // Sanitize content if provided
    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (summary) updateData.summary = DOMPurify.sanitize(summary);
    if (content) updateData.content = DOMPurify.sanitize(content);
    if (image_url) updateData.image_url = image_url;
    if (typeof published === 'boolean') updateData.published = published;

    // Update berita
    const updatedBerita = await Berita.findByIdAndUpdate(
      berita._id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      berita: updatedBerita,
    });
  } catch (error) {
    console.error('Error updating berita:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update berita' },
      { status: 500 }
    );
  }
}

// DELETE - Delete berita by slug (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect();

    const berita = await Berita.findOneAndDelete({ slug: params.slug });

    if (!berita) {
      return NextResponse.json(
        { success: false, error: 'Berita not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Berita deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting berita:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete berita' },
      { status: 500 }
    );
  }
}