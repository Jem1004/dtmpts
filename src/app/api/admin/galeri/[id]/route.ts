import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Galeri from '@/models/Galeri';
import DOMPurify from 'isomorphic-dompurify';
import mongoose from 'mongoose';

// GET - Fetch single galeri item by ID for admin
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

    const galeri = await Galeri.findById(params.id);

    if (!galeri) {
      return NextResponse.json(
        { success: false, error: 'Galeri item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      galeri,
    });
  } catch (error) {
    console.error('Error fetching galeri item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch galeri item' },
      { status: 500 }
    );
  }
}

// PUT - Update galeri item by ID (Admin only)
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
    const { title, description, image_url, type, published } = body;

    // Find galeri item by ID
    const galeri = await Galeri.findById(params.id);

    if (!galeri) {
      return NextResponse.json(
        { success: false, error: 'Galeri item not found' },
        { status: 404 }
      );
    }

    // Validate type if provided
    if (type && !['photo', 'video'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Must be photo or video' },
        { status: 400 }
      );
    }

    // Sanitize content if provided
    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (description) updateData.description = DOMPurify.sanitize(description);
    if (image_url) updateData.image_url = image_url;
    if (type) updateData.type = type;
    if (typeof published === 'boolean') updateData.published = published;

    // Update galeri item
    const updatedGaleri = await Galeri.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      galeri: updatedGaleri,
      message: 'Item galeri berhasil diperbarui',
    });
  } catch (error) {
    console.error('Error updating galeri item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update galeri item' },
      { status: 500 }
    );
  }
}

// DELETE - Delete galeri item by ID (Admin only)
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

    const galeri = await Galeri.findByIdAndDelete(params.id);

    if (!galeri) {
      return NextResponse.json(
        { success: false, error: 'Galeri item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Item galeri berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting galeri item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete galeri item' },
      { status: 500 }
    );
  }
}