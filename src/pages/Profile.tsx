
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Mail, Phone, Save, Edit2, AlertCircle } from "lucide-react";
import api from "@/lib/api";

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    username: user?.username || ""
  });
  
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        username: user.username || ""
      });
    }
  }, [user]);

  // Fetch fresh profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      if (isAuthenticated && user) {
        setProfileLoading(true);
        setProfileError(null);
        try {
          // Fetch fresh profile data from API
          const response = await api.get('/auth/me/');
          
          // Update form data with fresh data from API
          setFormData({
            first_name: response.data.first_name || "",
            last_name: response.data.last_name || "",
            email: response.data.email || "",
            username: response.data.username || ""
          });
        } catch (error: any) {
          console.error('Failed to load profile data:', error);
          
          const errorMessage = error.response?.data?.detail || 
                              error.message || 
                              "Failed to load profile data";
          setProfileError(errorMessage);
          toast.error(`Profile loading error: ${errorMessage}`);
        } finally {
          setProfileLoading(false);
        }
      }
    };

    fetchProfileData();
  }, [isAuthenticated, user]);

  if (isLoading || profileLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              {isLoading ? "Loading profile..." : "Fetching profile data..."}
            </h1>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
          </div>
        </div>
      </Layout>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await api.patch('/auth/me/', {
        first_name: formData.first_name,
        last_name: formData.last_name
      });
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      
      // Update the user context with new data
      // You might want to refresh the user data here
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || "Failed to update profile";
      toast.error(errorMessage);
      console.error("Profile update error:", error);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">My Profile</h1>
              <Button
                variant={isEditing ? "outline" : "default"}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  "Cancel"
                ) : (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>



            {profileError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Profile Loading Error</h3>
                    <p className="text-sm text-red-700 mt-1">{profileError}</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => window.location.reload()}
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    disabled={true}
                    className="pl-10 bg-gray-100"
                  />
                </div>
                {isEditing && (
                  <p className="text-xs text-gray-500">Username cannot be changed.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled={true}
                    className="pl-10 bg-gray-100"
                  />
                </div>
                {isEditing && (
                  <p className="text-xs text-gray-500">Email cannot be changed.</p>
                )}
              </div>

              {isEditing && (
                <Button type="submit" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
