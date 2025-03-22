'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  MoreHorizontal, 
  UserPlus, 
  ShieldCheck, 
  ShieldOff, 
  Ban, 
  UserCheck, 
  AlertTriangle, 
  Mail
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/common/Pagination';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

// User interface
interface User {
  id: string;
  email: string;
  created_at: string;
  phone: string | null;
  role: 'admin' | 'customer' | string;
  status: 'active' | 'suspended' | 'pending' | string;
  full_name: string | null;
  last_login: string | null;
  last_order_date: string | null;
  orders_count: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  
  // State for users
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // State for modals
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    action: '',
    selectedUser: null as User | null,
    processing: false
  });

  useEffect(() => {
    // Verify user is authenticated and has admin privileges
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!isAdmin) {
      router.push('/dashboard');
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access the admin area.",
      });
      return;
    }

    fetchUsers();
  }, [user, isAdmin, router]);

  // Apply filters and sorting whenever filter state changes
  useEffect(() => {
    applyFiltersAndSort();
  }, [searchQuery, roleFilter, statusFilter, sortBy, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch users with profiles and order counts
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          created_at,
          phone,
          role,
          status,
          full_name,
          last_login,
          last_order_date,
          orders_count:orders(count)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Transform data to match User interface
        const formattedUsers = data.map(user => ({
          ...user,
          orders_count: user.orders_count?.length || 0
        }));
        
        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
        calculateTotalPages(formattedUsers.length);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...users];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.full_name?.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query)
      );
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(user => user.status === statusFilter);
    }
    
    // Apply sorting
    result = sortUsers(result, sortBy);
    
    setFilteredUsers(result);
    calculateTotalPages(result.length);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const sortUsers = (users: User[], sortBy: string): User[] => {
    return [...users].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name_asc':
          return (a.full_name || '').localeCompare(b.full_name || '');
        case 'name_desc':
          return (b.full_name || '').localeCompare(a.full_name || '');
        case 'orders':
          return b.orders_count - a.orders_count;
        default:
          return 0;
      }
    });
  };

  const calculateTotalPages = (totalItems: number) => {
    setTotalPages(Math.ceil(totalItems / ITEMS_PER_PAGE));
  };

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (value: string) => {
    setSortBy(value);
  };

  // Open confirmation dialog
  const openConfirmDialog = (user: User, action: string) => {
    let title = '';
    let description = '';
    
    switch (action) {
      case 'makeAdmin':
        title = 'Make User Admin';
        description = `Are you sure you want to give admin privileges to ${user.full_name || user.email}? They will have full access to the admin panel.`;
        break;
      case 'removeAdmin':
        title = 'Remove Admin Privileges';
        description = `Are you sure you want to remove admin privileges from ${user.full_name || user.email}?`;
        break;
      case 'suspend':
        title = 'Suspend User';
        description = `Are you sure you want to suspend ${user.full_name || user.email}? They will not be able to log in or place orders while suspended.`;
        break;
      case 'activate':
        title = 'Activate User';
        description = `Are you sure you want to activate ${user.full_name || user.email}? This will restore their access to the platform.`;
        break;
    }
    
    setConfirmDialog({
      open: true,
      title,
      description,
      action,
      selectedUser: user,
      processing: false
    });
  };

  // Confirm user action
  const confirmUserAction = async () => {
    if (!confirmDialog.selectedUser) return;
    
    const { action, selectedUser } = confirmDialog;
    let updateData = {};
    
    setConfirmDialog(prev => ({ ...prev, processing: true }));
    
    try {
      switch (action) {
        case 'makeAdmin':
          updateData = { role: 'admin' };
          break;
        case 'removeAdmin':
          updateData = { role: 'customer' };
          break;
        case 'suspend':
          updateData = { status: 'suspended' };
          break;
        case 'activate':
          updateData = { status: 'active' };
          break;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', selectedUser.id);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, ...updateData } 
          : u
      ));
      
      // Show success message
      let successMessage = '';
      switch (action) {
        case 'makeAdmin':
          successMessage = `${selectedUser.full_name || selectedUser.email} is now an admin`;
          break;
        case 'removeAdmin':
          successMessage = `Admin privileges removed from ${selectedUser.full_name || selectedUser.email}`;
          break;
        case 'suspend':
          successMessage = `${selectedUser.full_name || selectedUser.email} has been suspended`;
          break;
        case 'activate':
          successMessage = `${selectedUser.full_name || selectedUser.email} has been activated`;
          break;
      }
      
      toast({
        title: "User updated",
        description: successMessage,
      });
      
      // Close dialog
      setConfirmDialog(prev => ({ ...prev, open: false }));
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user. Please try again.",
      });
    } finally {
      setConfirmDialog(prev => ({ ...prev, processing: false }));
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Admin</Badge>;
      case 'customer':
        return <Badge variant="outline">Customer</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Suspended</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 justify-between">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-40" />
              </div>
              
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-500 mt-1">Manage user accounts</p>
        </div>
        
        <Button className="mt-4 sm:mt-0">
          <UserPlus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>
      
      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            You have {filteredUsers.length} users {searchQuery || roleFilter !== 'all' || statusFilter !== 'all' ? 'matching the current filters' : 'in total'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search users by name, email, or phone..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Role" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={handleSort}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    <SelectValue placeholder="Sort By" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                  <SelectItem value="orders">Most Orders</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Table */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters to find what you\'re looking for'
                  : 'No users have registered yet'}
              </p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead>Last Order</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getCurrentPageItems().map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.full_name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                          {user.phone && <div className="text-xs text-gray-500">{user.phone}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(user.created_at)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(user.last_order_date)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.orders_count}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => window.location.href = `mailto:${user.email}`}>
                                <Mail className="mr-2 h-4 w-4" />
                                <span>Email User</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <UserCheck className="mr-2 h-4 w-4" />
                                <span>View Profile</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.role !== 'admin' ? (
                                <DropdownMenuItem onClick={() => openConfirmDialog(user, 'makeAdmin')}>
                                  <ShieldCheck className="mr-2 h-4 w-4" />
                                  <span>Make Admin</span>
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => openConfirmDialog(user, 'removeAdmin')}>
                                  <ShieldOff className="mr-2 h-4 w-4" />
                                  <span>Remove Admin</span>
                                </DropdownMenuItem>
                              )}
                              {user.status === 'active' ? (
                                <DropdownMenuItem onClick={() => openConfirmDialog(user, 'suspend')}>
                                  <Ban className="mr-2 h-4 w-4" />
                                  <span>Suspend User</span>
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => openConfirmDialog(user, 'activate')}>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  <span>Activate User</span>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                showSummary
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>
              {confirmDialog.description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-4 py-4">
            <div className="bg-yellow-100 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">
                This action may affect the user's ability to access and use the platform. 
                Please ensure this is the correct action to take.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
              disabled={confirmDialog.processing}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmUserAction} 
              disabled={confirmDialog.processing}
              variant={confirmDialog.action === 'suspend' ? 'destructive' : 'default'}
            >
              {confirmDialog.processing ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 