
'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import ProfileForm from "@/components/profile/ProfileForm";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.user_metadata?.name || 'User'}</p>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full bg-transparent border-b border-gray-200 rounded-none">
            <TabsTrigger value="profile" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Profile</TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">My Orders</TabsTrigger>
            <TabsTrigger value="appointments" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">My Appointments</TabsTrigger>
            <TabsTrigger value="prescriptions" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Prescriptions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Manage your personal information and preferences.</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileForm />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View and track your past and current orders.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-10 text-muted-foreground">You haven't placed any orders yet.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appointments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Appointment History</CardTitle>
                <CardDescription>View your past and upcoming appointments.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-10 text-muted-foreground">You don't have any appointments scheduled.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="prescriptions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Prescriptions</CardTitle>
                <CardDescription>Access and manage your digital prescriptions.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-10 text-muted-foreground">You don't have any prescriptions saved.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
