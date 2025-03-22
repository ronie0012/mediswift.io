import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getUserById, createUser, deleteUser, updateUserRole } from '@/lib/supabase-admin';
import { getSession } from '@/lib/auth';

async function isAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
  
  if (error || !data.user) {
    return false;
  }
  
  return data.user.app_metadata?.role === 'admin';
}

export async function GET(request: NextRequest) {
  try {
    // Check if current user is admin
    const session = await getSession();
    if (!session?.user?.id || !(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '10');
    
    // Get users with pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let usersQuery = supabaseAdmin.from('users').select('*', { count: 'exact' });

    // Apply search if provided
    if (query) {
      usersQuery = usersQuery.or(`name.ilike.%${query}%,email.ilike.%${query}%`);
    }

    const { data, count, error } = await usersQuery
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({
      users: data,
      totalCount: count,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage)
    });
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if current user is admin
    const session = await getSession();
    if (!session?.user?.id || !(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, userData, role } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Create the user in Auth
    const { user } = await createUser(email, password, {
      ...userData,
      role: role || 'user'
    });

    if (!user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // User metadata is automatically synced to the users table via the auth triggers

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Error in POST /api/admin/users:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check if current user is admin
    const session = await getSession();
    if (!session?.user?.id || !(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const userId = request.nextUrl.searchParams.get('id');
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Delete the user
    await deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/users:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    );
  }
} 