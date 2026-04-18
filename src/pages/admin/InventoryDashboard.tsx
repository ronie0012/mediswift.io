import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAdminMedicines, useCreateMedicine, useUpdateMedicine, useDeleteMedicine, useCategories, type Medicine } from "@/lib/api.hooks";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

const InventoryDashboard = () => {
  const { data: medicines, isLoading } = useAdminMedicines();
  const { data: categories = [] } = useCategories();
  
  const createMedicine = useCreateMedicine();
  const updateMedicine = useUpdateMedicine();
  const deleteMedicine = useDeleteMedicine();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    discount_price: "",
    stock: "100",
    quantity: "10 tablets",
    image_url: "",
    requires_prescription: false,
    is_featured: false,
  });

  const openEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      brand: medicine.brand,
      category: medicine.category ? String(medicine.category) : "",
      price: medicine.price,
      discount_price: medicine.discount_price || "",
      stock: String(medicine.stock),
      quantity: medicine.quantity,
      image_url: medicine.image || "",
      requires_prescription: medicine.requires_prescription,
      is_featured: medicine.is_featured,
    });
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setEditingMedicine(null);
    setFormData({
      name: "",
      brand: "",
      category: categories.length > 0 ? String(categories[0].id) : "",
      price: "",
      discount_price: "",
      stock: "100",
      quantity: "10 tablets",
      image_url: "/Paracetamol.webp",
      requires_prescription: false,
      is_featured: false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };
      payload.category = parseInt(payload.category);
      if (!payload.discount_price) delete payload.discount_price;

      if (editingMedicine) {
        await updateMedicine.mutateAsync({ id: editingMedicine.id, ...payload });
        toast.success("Medicine updated successfully");
      } else {
        await createMedicine.mutateAsync(payload);
        toast.success("Medicine added successfully");
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error("Failed to save medicine");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this medicine?")) {
      try {
        await deleteMedicine.mutateAsync(id);
        toast.success("Medicine deleted");
      } catch (err) {
        toast.error("Failed to delete medicine");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Inventory Management</h1>
          <p className="text-gray-500 mt-2">Add, edit, or remove medicines from the global database.</p>
        </div>
        <Button onClick={openCreate} className="bg-medical-600 hover:bg-medical-700">
          <Plus className="h-4 w-4 mr-2" /> Add Medicine
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Catalog</CardTitle>
          <CardDescription>Changes made here reflect immediately on the frontend.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-medical-600" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicines?.map(med => (
                  <TableRow key={med.id}>
                    <TableCell><img src={med.image} alt={med.name} className="w-10 h-10 object-contain rounded-md border p-1 bg-white" onError={(e) => { (e.target as HTMLImageElement).src = '/Paracetamol.webp'; }} /></TableCell>
                    <TableCell className="font-medium">{med.name}<div className="text-xs text-gray-500">{med.brand || 'Generic'}</div></TableCell>
                    <TableCell>{med.category_name}</TableCell>
                    <TableCell>₹{med.price}</TableCell>
                    <TableCell>{med.stock}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(med)}><Edit className="h-4 w-4 text-blue-600" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(med.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMedicine ? "Edit Medicine" : "Add New Medicine"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Medicine Name</Label>
                <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Brand (Optional)</Label>
                <Input value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  required 
                  value={formData.category} 
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Quantity Descriptor (e.g. 10 tablets)</Label>
                <Input required value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Original Price (₹)</Label>
                <Input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Discount Price (₹)</Label>
                <Input type="number" step="0.01" value={formData.discount_price} onChange={e => setFormData({ ...formData, discount_price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Stock Available</Label>
                <Input required type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label>Image Route path/URL</Label>
              <Input required value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} placeholder="/Paracetamol.webp" />
            </div>

            <div className="flex gap-6 mt-6">
              <div className="flex items-center space-x-2">
                <Checkbox id="rx" checked={formData.requires_prescription} onCheckedChange={(c) => setFormData({ ...formData, requires_prescription: !!c })} />
                <Label htmlFor="rx">Requires Prescription</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="feat" checked={formData.is_featured} onCheckedChange={(c) => setFormData({ ...formData, is_featured: !!c })} />
                <Label htmlFor="feat">Show in Featured/Home</Label>
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-medical-600 hover:bg-medical-700" disabled={createMedicine.isPending || updateMedicine.isPending}>
                {editingMedicine ? "Save Changes" : "Create Medicine"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </AdminLayout>
  );
};

export default InventoryDashboard;
