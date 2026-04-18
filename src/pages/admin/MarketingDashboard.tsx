import AdminLayout from "@/components/admin/AdminLayout";
import AdminRoute from "@/components/auth/AdminRoute";
import { useMarketingStats } from "@/lib/api.hooks";
import { TrendingUp, Users, Mail, Share2, Gift, Loader2, AlertCircle, ServerOff } from "lucide-react";

const StatCard = ({
  title, icon: Icon, color, fields
}: {
  title: string;
  icon: React.ElementType;
  color: string;
  fields: { label: string; value: string | number; note?: string }[];
}) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden`}>
    <div className={`px-6 py-4 ${color} flex items-center gap-3`}>
      <Icon className="h-5 w-5 text-white" />
      <h3 className="font-display font-bold text-white">{title}</h3>
    </div>
    <div className="p-5 divide-y divide-gray-50">
      {fields.map((f) => (
        <div key={f.label} className="py-2.5 flex justify-between items-center">
          <span className="text-sm text-gray-500">{f.label}</span>
          {f.note ? (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">{f.value}</span>
          ) : (
            <span className="text-sm font-semibold text-gray-800">{f.value}</span>
          )}
        </div>
      ))}
    </div>
  </div>
);

const MarketingDashboard = () => {
  const { data, isLoading, isError } = useMarketingStats();

  return (
    <AdminRoute>
      <AdminLayout
        title="Marketing Dashboard"
        subtitle="Live data from backend API"
      >
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-medical-500" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center py-20 text-center">
            <ServerOff className="h-12 w-12 text-red-400 mb-3" />
            <p className="font-semibold text-gray-700">Could not reach backend</p>
            <p className="text-sm text-gray-400 mt-1">Endpoint: <code className="bg-gray-100 px-1 rounded">/api/admin/marketing/stats/</code></p>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Explanation */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
              <h2 className="font-display font-bold text-gray-900 mb-2 text-lg">Marketing Strategy Overview</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                MediSwift employs a multi-channel marketing strategy to drive customer acquisition and retention. The five key pillars are{" "}
                <strong>Google Ads (PPC)</strong> for high-intent search traffic,{" "}
                <strong>Social Media Marketing</strong> for brand awareness,{" "}
                <strong>Referral Programs</strong> for organic growth,{" "}
                <strong>Email/WhatsApp Campaigns</strong> for re-engagement, and{" "}
                <strong>Content Marketing / SEO</strong> for long-term discoverability and trust.
              </p>
            </div>

            {/* Platform Stats from real DB */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-medical-50 rounded-2xl p-5 border border-medical-100">
                <p className="text-sm text-medical-600 font-medium">Registered Users</p>
                <p className="text-3xl font-display font-bold text-medical-700 mt-1">{data.platform_stats.registered_users}</p>
                <p className="text-xs text-medical-500 mt-1">From Django database</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
                <p className="text-sm text-green-600 font-medium">Total Medicines Listed</p>
                <p className="text-3xl font-display font-bold text-green-700 mt-1">{data.platform_stats.total_medicines}</p>
                <p className="text-xs text-green-500 mt-1">Active catalog</p>
              </div>
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                <p className="text-sm text-amber-600 font-medium">Customer Feedbacks</p>
                <p className="text-3xl font-display font-bold text-amber-700 mt-1">{data.platform_stats.total_feedback}</p>
                <p className="text-xs text-amber-500 mt-1">Total reported issues</p>
              </div>
            </div>

            {/* Channel Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <StatCard
                title="Strategy 1 — Google Ads / PPC"
                icon={TrendingUp}
                color="bg-blue-500"
                fields={[
                  { label: "Ad Spend", value: data.google_ads.spend as number || "Not connected", note: data.google_ads.note ? "pending" : undefined },
                  { label: "Impressions", value: data.google_ads.impressions as number || "—" },
                  { label: "Clicks", value: data.google_ads.clicks as number || "—" },
                  { label: "Conversions", value: data.google_ads.conversions as number || "—" },
                  { label: "Status", value: data.google_ads.note as string || "Connected", note: !!data.google_ads.note ? "info" : undefined },
                ]}
              />
              <StatCard
                title="Strategy 2 — Social Media"
                icon={Share2}
                color="bg-pink-500"
                fields={[
                  { label: "Followers", value: data.social_media.followers as number || "—" },
                  { label: "Posts This Month", value: data.social_media.posts as number || "—" },
                  { label: "Engagement Rate", value: data.social_media.engagement_rate as number || "—" },
                  { label: "Status", value: data.social_media.note as string || "Connected", note: !!data.social_media.note ? "info" : undefined },
                ]}
              />
              <StatCard
                title="Strategy 3 — Referral Program"
                icon={Gift}
                color="bg-purple-500"
                fields={[
                  { label: "Active Referrers", value: data.referral.total_referrers as number || "—" },
                  { label: "New Leads via Referral", value: data.referral.new_leads as number || "—" },
                  { label: "Codes Used", value: data.referral.codes_used as number || "—" },
                  { label: "Status", value: data.referral.note as string || "Active", note: !!data.referral.note ? "info" : undefined },
                ]}
              />
              <StatCard
                title="Strategy 4 — Email / WhatsApp Campaigns"
                icon={Mail}
                color="bg-green-500"
                fields={[
                  { label: "Emails Sent", value: data.email.sent as number || "—" },
                  { label: "Open Rate", value: data.email.open_rate ? `${data.email.open_rate}%` : "—" },
                  { label: "Click-Through Rate", value: data.email.click_through_rate ? `${data.email.click_through_rate}%` : "—" },
                  { label: "Status", value: data.email.note as string || "Active", note: !!data.email.note ? "info" : undefined },
                ]}
              />
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Strategy 5 — Content Marketing / SEO
              </h3>
              <p className="text-sm text-gray-500">
                MediSwift publishes weekly health articles, drug interaction guides, and disease management tips.
                SEO tracking via Google Search Console shows growing organic reach for medicine-related search queries.
                Connect Google Search Console API to display live keyword ranking data here.
              </p>
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminRoute>
  );
};

export default MarketingDashboard;
