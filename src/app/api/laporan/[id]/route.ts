import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Laporan from '@/models/Laporan';
import mongoose from 'mongoose';

// GET - Fetch single laporan by ID (Admin only)
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

    const laporan = await Laporan.findById(params.id);

    if (!laporan) {
      return NextResponse.json(
        { success: false, error: 'Laporan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      laporan,
    });
  } catch (error) {
    console.error('Error fetching laporan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch laporan' },
      { status: 500 }
    );
  }
}

// PUT - Update laporan status by ID (Admin only)
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
    const { status } = body;

    // Validate status
    const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    // Find laporan by ID
    const laporan = await Laporan.findById(params.id);

    if (!laporan) {
      return NextResponse.json(
        { success: false, error: 'Laporan not found' },
        { status: 404 }
      );
    }

    // Update laporan status
    const updatedLaporan = await Laporan.findByIdAndUpdate(
      params.id,
      { status },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      laporan: updatedLaporan,
      message: `Status laporan berhasil diubah menjadi ${status}`,
    });
  } catch (error) {
    console.error('Error updating laporan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update laporan' },
      { status: 500 }
    );
  }
}

// DELETE - Delete laporan by ID (Admin only)
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

    const laporan = await Laporan.findByIdAndDelete(params.id);

    if (!laporan) {
      return NextResponse.json(
        { success: false, error: 'Laporan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Laporan deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting laporan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete laporan' },
      { status: 500 }
    );
  }
}