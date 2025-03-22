import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if it's an admin request to get all orders
    const searchParams = request.nextUrl.searchParams;
    const isAdminRequest = searchParams.get('admin') === 'true';
    
    if (isAdminRequest) {
      // Only admins can access all orders
      const isUserAdmin = await isAdmin();
      if (!isUserAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      
      // Get query parameters for admin view
      const status = searchParams.get('status');
      const startDate = searchParams.get('start_date');
      const endDate = searchParams.get('end_date');
      const page = parseInt(searchParams.get('page') || '1');
      const perPage = parseInt(searchParams.get('per_page') || '10');
      
      // Build the admin query
      let query = supabase
        .from('orders')
        .select('*, users(name, email, phone)', { count: 'exact' });
      
      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }
      
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      
      // Apply pagination
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);
      
      // Order by date (newest first)
      query = query.order('created_at', { ascending: false });
      
      // Execute the query
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Error fetching all orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
      }
      
      // Get all order items
      const orderIds = data?.map(order => order.id) || [];
      let orderItems = [];
      
      if (orderIds.length > 0) {
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*, medicines(name, image)')
          .in('order_id', orderIds);
        
        if (itemsError) {
          console.error('Error fetching order items:', itemsError);
        } else {
          orderItems = items || [];
        }
      }
      
      // Group items by order_id
      const itemsByOrder = orderItems.reduce((acc, item) => {
        if (!acc[item.order_id]) {
          acc[item.order_id] = [];
        }
        acc[item.order_id].push(item);
        return acc;
      }, {});
      
      // Add items to each order
      const ordersWithItems = data?.map(order => ({
        ...order,
        items: itemsByOrder[order.id] || []
      }));
      
      // Return the result
      return NextResponse.json({
        orders: ordersWithItems,
        totalCount: count,
        page,
        perPage,
        totalPages: Math.ceil((count || 0) / perPage)
      });
    } else {
      // Regular user can only see their own orders
      // Get filters
      const status = searchParams.get('status');
      const page = parseInt(searchParams.get('page') || '1');
      const perPage = parseInt(searchParams.get('per_page') || '10');
      
      // Build the query
      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);
      
      if (status) {
        query = query.eq('status', status);
      }
      
      // Apply pagination
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);
      
      // Order by date (newest first)
      query = query.order('created_at', { ascending: false });
      
      // Execute the query
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Error fetching user orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
      }
      
      // Get all order items
      const orderIds = data?.map(order => order.id) || [];
      let orderItems = [];
      
      if (orderIds.length > 0) {
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*, medicines(name, image)')
          .in('order_id', orderIds);
        
        if (itemsError) {
          console.error('Error fetching order items:', itemsError);
        } else {
          orderItems = items || [];
        }
      }
      
      // Group items by order_id
      const itemsByOrder = orderItems.reduce((acc, item) => {
        if (!acc[item.order_id]) {
          acc[item.order_id] = [];
        }
        acc[item.order_id].push(item);
        return acc;
      }, {});
      
      // Add items to each order
      const ordersWithItems = data?.map(order => ({
        ...order,
        items: itemsByOrder[order.id] || []
      }));
      
      // Return the result
      return NextResponse.json({
        orders: ordersWithItems,
        totalCount: count,
        page,
        perPage,
        totalPages: Math.ceil((count || 0) / perPage)
      });
    }
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const {
      items,
      payment_method,
      delivery_address,
    } = body;
    
    // Validate required fields
    if (!items || !items.length || !payment_method || !delivery_address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate items format
    const isValidItems = items.every(item => 
      typeof item.medicine_id === 'number' && 
      typeof item.quantity === 'number' && 
      item.quantity > 0
    );
    
    if (!isValidItems) {
      return NextResponse.json(
        { error: 'Invalid items format' },
        { status: 400 }
      );
    }
    
    // Get medicine information and check stock
    const medicineIds = items.map(item => item.medicine_id);
    const { data: medicines, error: medicinesError } = await supabase
      .from('medicines')
      .select('id, name, price, stock')
      .in('id', medicineIds);
    
    if (medicinesError || !medicines) {
      console.error('Error fetching medicines:', medicinesError);
      return NextResponse.json(
        { error: 'Failed to fetch medicine details' },
        { status: 500 }
      );
    }
    
    // Create a map of medicine id to medicine details
    const medicineMap = medicines.reduce((acc, medicine) => {
      acc[medicine.id] = medicine;
      return acc;
    }, {});
    
    // Check stock and calculate total
    let total_amount = 0;
    const orderItems = [];
    const stockUpdates = [];
    
    for (const item of items) {
      const medicine = medicineMap[item.medicine_id];
      
      // Check if medicine exists
      if (!medicine) {
        return NextResponse.json(
          { error: `Medicine with ID ${item.medicine_id} not found` },
          { status: 404 }
        );
      }
      
      // Check stock
      if (medicine.stock < item.quantity) {
        return NextResponse.json(
          { error: `Not enough stock for ${medicine.name}. Available: ${medicine.stock}` },
          { status: 400 }
        );
      }
      
      // Calculate item price and add to total
      const itemPrice = medicine.price * item.quantity;
      total_amount += itemPrice;
      
      // Add to order items
      orderItems.push({
        medicine_id: item.medicine_id,
        quantity: item.quantity,
        price: medicine.price
      });
      
      // Add to stock updates
      stockUpdates.push({
        id: medicine.id,
        stock: medicine.stock - item.quantity
      });
    }
    
    // Use a transaction to create the order and items
    // We use the admin client for RPC transactions
    const { data: order, error: orderError } = await supabaseAdmin.rpc(
      'create_order_transaction',
      {
        p_user_id: user.id,
        p_total_amount: total_amount,
        p_payment_method: payment_method,
        p_delivery_address: delivery_address,
        p_items: JSON.stringify(orderItems)
      }
    );
    
    if (orderError || !order) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }
    
    // Update stock for each medicine
    for (const update of stockUpdates) {
      const { error: updateError } = await supabase
        .from('medicines')
        .update({ stock: update.stock })
        .eq('id', update.id);
      
      if (updateError) {
        console.error(`Error updating stock for medicine ${update.id}:`, updateError);
        // Continue with other updates, don't return error
      }
    }
    
    // Get the full order with items
    const { data: createdOrder, error: createdOrderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order.id)
      .single();
    
    if (createdOrderError) {
      console.error('Error fetching created order:', createdOrderError);
      return NextResponse.json(
        { error: 'Order created but failed to fetch details' },
        { status: 500 }
      );
    }
    
    // Get the order items
    const { data: createdItems, error: createdItemsError } = await supabase
      .from('order_items')
      .select('*, medicines(name, image)')
      .eq('order_id', order.id);
    
    if (createdItemsError) {
      console.error('Error fetching created items:', createdItemsError);
      return NextResponse.json(
        { error: 'Order created but failed to fetch item details' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      order: {
        ...createdOrder,
        items: createdItems || []
      }
    });
  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }
    
    // Valid statuses
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }
    
    // Get the order to check ownership
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (orderError || !order) {
      console.error('Error getting order:', orderError);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to update this order
    const isUserAdmin = await isAdmin();
    const isOwner = order.user_id === user.id;
    
    // Users can only cancel their own pending orders
    // Admins can update any order
    if (!isUserAdmin && (!isOwner || (status !== 'CANCELLED' || order.status !== 'PENDING'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Handle stock updates for cancellations
    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      // Get order items
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('medicine_id, quantity')
        .eq('order_id', id);
      
      if (itemsError) {
        console.error('Error getting order items:', itemsError);
        return NextResponse.json(
          { error: 'Failed to get order items' },
          { status: 500 }
        );
      }
      
      // Update stock for each medicine
      if (items && items.length > 0) {
        for (const item of items) {
          // Get current stock
          const { data: medicine, error: medicineError } = await supabase
            .from('medicines')
            .select('stock')
            .eq('id', item.medicine_id)
            .single();
          
          if (medicineError) {
            console.error(`Error getting medicine ${item.medicine_id}:`, medicineError);
            continue;
          }
          
          // Update stock
          const newStock = medicine.stock + item.quantity;
          const { error: updateError } = await supabase
            .from('medicines')
            .update({ stock: newStock })
            .eq('id', item.medicine_id);
          
          if (updateError) {
            console.error(`Error updating stock for medicine ${item.medicine_id}:`, updateError);
            // Continue with other updates
          }
        }
      }
    }
    
    // Update the order
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ order: data });
  } catch (error) {
    console.error('Error in PUT /api/orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 