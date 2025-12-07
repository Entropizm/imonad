import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import App from '@/lib/models/App';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const app = await App.findById(params.id);
    
    if (!app) {
      return NextResponse.json(
        { success: false, error: 'App not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, app });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    const app = await App.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!app) {
      return NextResponse.json(
        { success: false, error: 'App not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, app });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const app = await App.findByIdAndDelete(params.id);
    
    if (!app) {
      return NextResponse.json(
        { success: false, error: 'App not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'App deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

