import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'name';
    const order = searchParams.get('order') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '10');
    
    // Build the query
    let query = supabase
      .from('medicines')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    
    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }
    
    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // Apply sorting
    if (sort && order) {
      query = query.order(sort, { ascending: order === 'asc' });
    }
    
    // Apply pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching medicines:', error);
      return NextResponse.json({ error: 'Failed to fetch medicines' }, { status: 500 });
    }
    
    // Return the result
    return NextResponse.json({
      medicines: data,
      totalCount: count,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage)
    });
  } catch (error) {
    console.error('Error in GET /api/medicines:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const body = await request.json();
    const {
      name,
      brand,
      price,
      discount_price,
      category,
      quantity,
      image,
      description,
      usage,
      side_effects,
      contraindications,
      stock
    } = body;
    
    // Validate required fields
    if (!name || !brand || !price || !category || !quantity || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Insert the medicine
    const { data, error } = await supabase
      .from('medicines')
      .insert({
        name,
        brand,
        price,
        discount_price,
        category,
        quantity,
        image: image || '',
        description,
        usage: usage || '',
        side_effects: side_effects || '',
        contraindications: contraindications || '',
        stock: stock || 0,
        rating: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating medicine:', error);
      return NextResponse.json(
        { error: 'Failed to create medicine' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ medicine: data });
  } catch (error) {
    console.error('Error in POST /api/medicines:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check if user is admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Medicine ID is required' },
        { status: 400 }
      );
    }
    
    // Remove any fields that aren't allowed to be updated
    const { created_at, ...validUpdates } = updates;
    
    // Update the medicine
    const { data, error } = await supabase
      .from('medicines')
      .update({
        ...validUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating medicine:', error);
      return NextResponse.json(
        { error: 'Failed to update medicine' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ medicine: data });
  } catch (error) {
    console.error('Error in PUT /api/medicines:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check if user is admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Medicine ID is required' },
        { status: 400 }
      );
    }
    
    // Check if this medicine is part of any orders
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('id')
      .eq('medicine_id', id)
      .limit(1);
    
    if (orderItemsError) {
      console.error('Error checking order items:', orderItemsError);
      return NextResponse.json(
        { error: 'Failed to check if medicine is in use' },
        { status: 500 }
      );
    }
    
    if (orderItems && orderItems.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete medicine that is part of existing orders' },
        { status: 400 }
      );
    }
    
    // Delete the medicine
    const { error } = await supabase
      .from('medicines')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting medicine:', error);
      return NextResponse.json(
        { error: 'Failed to delete medicine' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/medicines:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 