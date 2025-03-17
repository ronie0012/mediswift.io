
import React, { useState } from "react";
import { 
  Card, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2,
  Home,
  Check
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Address, useAddress } from "@/context/AddressContext";
import AddressForm from "./AddressForm";
import { toast } from "sonner";

const AddressSelector: React.FC = () => {
  const { addresses, selectedAddress, selectAddress, removeAddress, setDefaultAddress } = useAddress();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowAddForm(true);
  };
  
  const handleDelete = (id: string) => {
    removeAddress(id);
    toast.success("Address removed");
  };
  
  const handleSetDefault = (id: string) => {
    setDefaultAddress(id);
    toast.success("Default address updated");
  };
  
  const handleSelect = (id: string) => {
    selectAddress(id);
  };
  
  const closeDialog = () => {
    setShowAddForm(false);
    setEditingAddress(null);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Delivery Address
        </h2>
        <Button 
          size="sm" 
          variant="outline" 
          className="flex items-center"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add New
        </Button>
      </div>
      
      {addresses.length === 0 ? (
        <Card className="border-dashed border-2 bg-gray-50">
          <CardContent className="pt-6 text-center">
            <MapPin className="h-10 w-10 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No addresses saved yet</p>
            <Button 
              className="mt-4" 
              variant="outline"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add an Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <Card 
              key={address.id} 
              className={`border ${selectedAddress?.id === address.id ? 'border-medical-500 bg-medical-50' : 'border-gray-200'}`}
            >
              <CardContent className="pt-4 pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium">{address.name}</h3>
                      {address.isDefault && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-medical-100 text-medical-700 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{address.street}</p>
                    <p className="text-sm text-gray-600">{address.city}, {address.state} {address.pincode}</p>
                    <p className="text-sm text-gray-600 mt-1">Phone: {address.phone}</p>
                  </div>
                  
                  {selectedAddress?.id === address.id && (
                    <div className="bg-medical-500 text-white p-1 rounded-full">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between py-2">
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-500"
                    onClick={() => handleEdit(address)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500"
                    onClick={() => handleDelete(address.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
                
                <div className="flex space-x-2">
                  {!address.isDefault && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      <Home className="h-4 w-4 mr-1" />
                      Set as Default
                    </Button>
                  )}
                  {selectedAddress?.id !== address.id && (
                    <Button 
                      size="sm"
                      onClick={() => handleSelect(address.id)}
                    >
                      Deliver Here
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit Address" : "Add New Address"}
            </DialogTitle>
          </DialogHeader>
          <AddressForm 
            existingAddress={editingAddress || undefined}
            onCancel={closeDialog}
            onSave={closeDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddressSelector;
