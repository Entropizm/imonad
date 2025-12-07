import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import App from '@/lib/models/App';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const app = await App.findByIdAndUpdate(
      params.id,
      { $inc: { downloads: 1 } },
      { new: true }
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

