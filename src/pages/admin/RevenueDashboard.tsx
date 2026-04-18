import AdminLayout from "@/components/admin/AdminLayout";
import AdminRoute from "@/components/auth/AdminRoute";
import { useRevenueStats } from "@/lib/api.hooks";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2, ServerOff, IndianRupee } from "lucide-react";

const MODEL_COLORS: Record<string, string> = {
  sales: "#0ea5e9",
  subscription: "#8b5cf6",
  transaction_fee: "#10b981",
  advertising: "#f59e0b",
  affiliate: "#ef4444",
};

const MODEL_DESCRIPTIONS: Record<string, string> = {
  sales: "Revenue from direct medicine and health-product purchases by customers on the platform.",
  subscription: "Monthly recurring income from 'MediSwift Plus' memberships offering priority delivery, free consultations, and exclusive discounts.",
  transaction_fee: "Convenience and delivery charges collected per order, covering last-mile logistics.",
  advertising: "Income from pharmaceutical companies and brands for sponsored product placement and featured listings.",
  affiliate: "Commission earned by referring patients to partner diagnostic labs, insurance providers, and specialist clinics.",
};

const RevenueDashboard = () => {
  const { data, isLoading, isError } = useRevenueStats();

  return (
    <AdminRoute>
      <AdminLayout title="Revenue Dashboard" subtitle="Live breakdown from backend API">
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-medical-500" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center py-20 text-center">
            <ServerOff className="h-12 w-12 text-red-400 mb-3" />
            <p className="font-semibold text-gray-700">Could not reach backend</p>
            <p className="text-sm text-gray-400 mt-1">
              Endpoint: <code className="bg-gray-100 px-1 rounded">/api/admin/revenue/stats/</code>
            </p>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Total Revenue */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-1 bg-gradient-to-br from-medical-600 to-medical-400 rounded-2xl p-7 text-white shadow-xl shadow-medical-500/20">
                <p className="text-sm font-medium opacity-80 mb-1">Total Revenue</p>
                <p className="text-4xl font-display font-bold flex items-center gap-1">
                  <IndianRupee className="h-7 w-7" />
                  {data.total.toLocaleString('en-IN')}
                </p>
                <p className="text-xs opacity-70 mt-2 capitalize">{data.period.replace("_", " ")} · {data.currency}</p>
                {data.note && (
                  <p className="text-xs mt-3 bg-white/10 rounded-lg px-3 py-2">{data.note}</p>
                )}
              </div>

              <div className="md:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h3 className="font-display font-bold text-gray-900 mb-4">Revenue by Stream</h3>
                {data.breakdown.every(b => b.amount === 0) ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-center">
                    <p className="text-sm font-medium">No revenue data yet</p>
                    <p className="text-xs mt-1">Connect a payment gateway (Razorpay/Stripe) to see live figures.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={data.breakdown} dataKey="amount" nameKey="stream" cx="50%" cy="50%" outerRadius={80} label>
                        {data.breakdown.map((_, i) => (
                          <Cell key={i} fill={Object.values(MODEL_COLORS)[i % 5]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => `₹${val}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Revenue Breakdown Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <h3 className="font-display font-bold text-gray-900">Revenue Model Breakdown</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {data.breakdown.map((item) => (
                  <div key={item.model_type} className="px-6 py-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: MODEL_COLORS[item.model_type] || "#a3a3a3" }}
                        />
                        <span className="font-semibold text-gray-800">{item.stream}</span>
                      </div>
                      <span className="text-lg font-display font-bold text-gray-900">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 pl-6">{MODEL_DESCRIPTIONS[item.model_type]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminRoute>
  );
};

export default RevenueDashboard;
