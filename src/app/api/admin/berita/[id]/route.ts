import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Berita from '@/models/Berita';
import DOMPurify from 'isomorphic-dompurify';
import mongoose from 'mongoose';

// GET - Fetch single berita by ID for admin
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const berita = await Berita.findById(params.id);

    if (!berita) {
      return NextResponse.json(
        { success: false, error: 'Berita not found' },
        { status: 404 }
      );
    }

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

// PUT - Update berita by ID (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, summary, content, image_url, published } = body;

    // Find berita by ID
    const berita = await Berita.findById(params.id);

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
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      berita: updatedBerita,
      message: 'Berita berhasil diperbarui',
    });
  } catch (error) {
    console.error('Error updating berita:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update berita' },
      { status: 500 }
    );
  }
}

// DELETE - Delete berita by ID (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const berita = await Berita.findByIdAndDelete(params.id);

    if (!berita) {
      return NextResponse.json(
        { success: false, error: 'Berita not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Berita berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting berita:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete berita' },
      { status: 500 }
    );
  }
}