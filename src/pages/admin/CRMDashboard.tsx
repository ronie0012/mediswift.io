import AdminLayout from "@/components/admin/AdminLayout";
import AdminRoute from "@/components/auth/AdminRoute";
import { useAdminFeedback, useAdminFeedbackAnalysis } from "@/lib/api.hooks";
import { Loader2, ServerOff, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const CATEGORY_LABELS: Record<string, string> = {
  wrong_medicine: "Wrong Medicine",
  late_delivery: "Late Delivery",
  payment_issue: "Payment Issue",
  app_bug: "App Bug",
  other: "Other",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-red-100 text-red-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
};

const CRMDashboard = () => {
  const { data: feedbacks, isLoading: fbLoading, isError: fbError } = useAdminFeedback();
  const { data: analysis, isLoading: anLoading, isError: anError } = useAdminFeedbackAnalysis();
  const queryClient = useQueryClient();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'feedback'] });
  };

  return (
    <AdminRoute>
      <AdminLayout title="CRM & Feedback Analysis" subtitle="Live customer support data">
        <div className="space-y-6">
          {/* Analysis Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-gray-900">Automated Analysis Summary</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Our system automatically clusters feedback by category, computes percentages, and surfaces the most critical issues without manual review.
                </p>
              </div>
              <button
                onClick={refresh}
                className="flex items-center gap-1.5 text-sm text-medical-600 hover:text-medical-700 font-medium"
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>

            {anLoading && (
              <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-medical-500" /></div>
            )}
            {anError && (
              <div className="flex flex-col items-center py-10 text-center">
                <ServerOff className="h-10 w-10 text-red-400 mb-2" />
                <p className="text-sm text-gray-500">Endpoint: <code className="bg-gray-100 px-1 rounded">/api/admin/feedback/analysis/</code></p>
              </div>
            )}

            {analysis && (
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <p className="text-5xl font-display font-bold text-gray-900">{analysis.total_reports}</p>
                    <p className="text-sm text-gray-500 mt-1">Total reports — {analysis.period}</p>
                  </div>
                  {analysis.total_reports === 0 && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-medium">No feedback submitted yet</span>
                    </div>
                  )}
                </div>

                {analysis.clusters.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {analysis.clusters.map((cluster) => (
                      <div key={cluster.issue} className="py-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                            <span className="font-semibold text-gray-800 text-sm">{cluster.issue}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 pl-6">{cluster.count} reports</p>
                        </div>
                        <div className="pl-6 md:pl-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                              <div
                                className="bg-medical-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${cluster.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-medical-600 w-12 text-right">{cluster.percentage}%</span>
                          </div>
                        </div>
                        <div className="pl-6 md:pl-0 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
                          <span className="font-semibold text-gray-700">Action Taken: </span>
                          {cluster.action_taken}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 py-4">No clusters to display. Submit feedback via the Support page to see analysis here.</p>
                )}
              </div>
            )}
          </div>

          {/* Feedback List Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h3 className="font-display font-bold text-gray-900">Recent Feedback &amp; Complaints</h3>
            </div>

            {fbLoading && (
              <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-medical-500" /></div>
            )}
            {fbError && (
              <div className="text-center py-10">
                <p className="text-sm text-gray-500">Could not load feedback list.</p>
              </div>
            )}

            {feedbacks && (
              feedbacks.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="font-medium">No customer feedback submitted yet.</p>
                  <p className="text-sm mt-1">Feedback submitted via the Support page will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {feedbacks.map((fb) => (
                        <tr key={fb.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 text-gray-400 whitespace-nowrap">
                            {new Date(fb.created_at).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-5 py-3 font-medium text-gray-800">{fb.name || '—'}</td>
                          <td className="px-5 py-3">
                            <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                              {CATEGORY_LABELS[fb.category] || fb.category}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-gray-600 max-w-xs truncate">{fb.subject}</td>
                          <td className="px-5 py-3">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_COLORS[fb.status] || 'bg-gray-100 text-gray-600'}`}>
                              {fb.status.replace("_", " ")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};

export default CRMDashboard;
