
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Address, useAddress } from "@/context/AddressContext";
import { toast } from "sonner";

interface AddressFormProps {
  existingAddress?: Address;
  onCancel?: () => void;
  onSave?: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ 
  existingAddress, 
  onCancel,
  onSave
}) => {
  const { addAddress, updateAddress } = useAddress();
  
  const [name, setName] = useState(existingAddress?.name || "");
  const [street, setStreet] = useState(existingAddress?.street || "");
  const [city, setCity] = useState(existingAddress?.city || "");
  const [state, setState] = useState(existingAddress?.state || "");
  const [pincode, setPincode] = useState(existingAddress?.pincode || "");
  const [phone, setPhone] = useState(existingAddress?.phone || "");
  const [isDefault, setIsDefault] = useState(existingAddress?.isDefault || false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !street || !city || !state || !pincode || !phone) {
      toast.error("Please fill in all fields");
      return;
    }
    
    const addressData = {
      name,
      street,
      city,
      state,
      pincode,
      phone,
      isDefault
    };
    
    if (existingAddress) {
      updateAddress(existingAddress.id, addressData);
      toast.success("Address updated successfully");
    } else {
      addAddress(addressData);
      toast.success("Address added successfully");
    }
    
    if (onSave) onSave();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="street">Street Address</Label>
        <Input
          id="street"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="123 Main St, Apt 4B"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="New York"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="NY"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pincode">PIN Code</Label>
          <Input
            id="pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="10001"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (123) 456-7890"
            required
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="default" 
          checked={isDefault}
          onCheckedChange={(checked) => setIsDefault(checked === true)}
        />
        <Label htmlFor="default" className="font-normal">
          Set as default address
        </Label>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button type="submit">
          {existingAddress ? "Update Address" : "Save Address"}
        </Button>
      </div>
    </form>
  );
};

export default AddressForm;
