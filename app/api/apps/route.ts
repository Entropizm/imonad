import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import App from '@/lib/models/App';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const creator = searchParams.get('creator');
    
    let query: any = {};
    if (category) query.category = category;
    if (creator) query.creator = creator;
    
    const apps = await App.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, apps });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, description, category, icon, code, creator, tokenAddress } = body;
    
    if (!name || !description || !category || !code || !creator) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const app = await App.create({
      name,
      description,
      category,
      icon: icon || '📱',
      code,
      creator,
      tokenAddress,
      downloads: 0,
    });
    
    return NextResponse.json({ success: true, app }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

