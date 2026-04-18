import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminOrders, useUpdateOrderStatus, type Order } from "@/lib/api.hooks";
import { Loader2, Package, Check, X, Clock, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const OrdersDashboard = () => {
  const { data: orders, isLoading } = useAdminOrders();
  const updateStatus = useUpdateOrderStatus();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status });
      toast.success(`Order #${orderId} status updated to ${status}`);
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
      case "shipped": return <Badge className="bg-blue-500 hover:bg-blue-600"><Package className="w-3 h-3 mr-1"/> Shipped</Badge>;
      case "delivered": return <Badge className="bg-green-500 hover:bg-green-600"><Check className="w-3 h-3 mr-1"/> Delivered</Badge>;
      case "cancelled": return <Badge variant="destructive"><X className="w-3 h-3 mr-1"/> Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Orders Management</h1>
          <p className="text-gray-500 mt-2">View and process incoming customer orders seamlessly.</p>
        </div>
      </div>

      <Card className="border-gray-200/60 shadow-sm">
        <CardHeader className="bg-white border-b border-gray-100">
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>All placed orders sorted by most recent.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-medical-600" />
            </div>
          ) : orders?.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Orders Found</h3>
              <p className="text-gray-500">You haven't received any orders yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="w-[100px]">Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer hover:bg-gray-50/50">
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{order.customer_name}</div>
                      <div className="text-xs text-gray-500">{order.customer_email}</div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">₹{order.total_amount}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={order.status}
                        onValueChange={(val) => handleStatusChange(order.id, val)}
                        disabled={updateStatus.isPending}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs font-medium">
                          <SelectValue>{getStatusBadge(order.status)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                            <Eye className="h-4 w-4 mr-2" /> View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Order Details #{order.id}</DialogTitle>
                          </DialogHeader>
                          
                          <div className="grid grid-cols-2 gap-6 py-4">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">Customer Info</h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>Name:</strong> {order.customer_name}</p>
                                <p><strong>Email:</strong> {order.customer_email}</p>
                                <p><strong>Phone:</strong> {order.customer_phone}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">Delivery</h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>Address:</strong> <br/>{order.shipping_address}</p>
                                <p><strong>Payment:</strong> {order.payment_method}</p>
                                <p><strong>Status:</strong> {order.status.toUpperCase()}</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 border-t pt-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4">Ordered Items</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Medicine</TableHead>
                                  <TableHead>Price</TableHead>
                                  <TableHead>Qty</TableHead>
                                  <TableHead className="text-right">Subtotal</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {order.items.map(item => (
                                  <TableRow key={item.id}>
                                    <TableCell className="font-medium text-xs">{item.medicine_name}</TableCell>
                                    <TableCell className="text-xs">₹{item.price}</TableCell>
                                    <TableCell className="text-xs">{item.quantity}</TableCell>
                                    <TableCell className="text-right text-xs font-semibold">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            <div className="flex justify-end mt-4 text-lg font-bold">
                              Total: ₹{order.total_amount}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default OrdersDashboard;
