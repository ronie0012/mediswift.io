
import React, { createContext, useContext, useState, useEffect } from "react";

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

interface AddressContextType {
  addresses: Address[];
  selectedAddress: Address | null;
  addAddress: (address: Omit<Address, "id">) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  selectAddress: (id: string) => void;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  
  // Load addresses from localStorage on initial render
  useEffect(() => {
    const storedAddresses = localStorage.getItem("addresses");
    if (storedAddresses) {
      try {
        const parsedAddresses = JSON.parse(storedAddresses);
        setAddresses(parsedAddresses);
        
        // Set selected address to default address if available
        const defaultAddress = parsedAddresses.find((address: Address) => address.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        } else if (parsedAddresses.length > 0) {
          setSelectedAddress(parsedAddresses[0]);
        }
      } catch (error) {
        console.error("Error parsing addresses:", error);
      }
    }
  }, []);
  
  // Save addresses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("addresses", JSON.stringify(addresses));
  }, [addresses]);
  
  const addAddress = (address: Omit<Address, "id">) => {
    const newAddress: Address = {
      ...address,
      id: Date.now().toString()
    };
    
    // If this is the first address, make it default
    if (addresses.length === 0) {
      newAddress.isDefault = true;
    }
    
    setAddresses(prev => [...prev, newAddress]);
    
    // If this is the first address or it's marked as default, select it
    if (addresses.length === 0 || newAddress.isDefault) {
      setSelectedAddress(newAddress);
    }
  };
  
  const updateAddress = (id: string, updatedFields: Partial<Address>) => {
    setAddresses(prev => 
      prev.map(address => 
        address.id === id ? { ...address, ...updatedFields } : address
      )
    );
    
    // Update selected address if it was the one modified
    if (selectedAddress && selectedAddress.id === id) {
      setSelectedAddress(prev => prev ? { ...prev, ...updatedFields } : null);
    }
  };
  
  const removeAddress = (id: string) => {
    // Check if we're removing the default address
    const isRemovingDefault = addresses.find(address => address.id === id)?.isDefault;
    
    const updatedAddresses = addresses.filter(address => address.id !== id);
    setAddresses(updatedAddresses);
    
    // If we removed the selected address, select another one
    if (selectedAddress && selectedAddress.id === id) {
      // If we removed the default address and have other addresses, make another one default
      if (isRemovingDefault && updatedAddresses.length > 0) {
        const newDefault = { ...updatedAddresses[0], isDefault: true };
        setSelectedAddress(newDefault);
        setAddresses(prev => 
          prev.map(address => 
            address.id === newDefault.id ? newDefault : address
          )
        );
      } else if (updatedAddresses.length > 0) {
        // Just select the first available address
        setSelectedAddress(updatedAddresses[0]);
      } else {
        setSelectedAddress(null);
      }
    }
  };
  
  const setDefaultAddress = (id: string) => {
    setAddresses(prev => 
      prev.map(address => ({
        ...address,
        isDefault: address.id === id
      }))
    );
    
    // Update selected address to the new default
    const newDefault = addresses.find(address => address.id === id);
    if (newDefault) {
      setSelectedAddress({ ...newDefault, isDefault: true });
    }
  };
  
  const selectAddress = (id: string) => {
    const address = addresses.find(address => address.id === id);
    if (address) {
      setSelectedAddress(address);
    }
  };
  
  return (
    <AddressContext.Provider
      value={{
        addresses,
        selectedAddress,
        addAddress,
        updateAddress,
        removeAddress,
        setDefaultAddress,
        selectAddress,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (context === undefined) {
    throw new Error("useAddress must be used within an AddressProvider");
  }
  return context;
};
