import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadPrescription } from "@/lib/api.hooks";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

const PrescriptionModal = ({ onClose }: { onClose: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { mutateAsync, isPending } = useUploadPrescription();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("notes", notes);
    try {
      await mutateAsync(fd);
      toast({ title: "✅ Prescription Uploaded!", description: "Our pharmacist will review it shortly." });
      onClose();
    } catch (err: any) {
      const msg = err?.response?.status === 401
        ? "Please log in to upload a prescription."
        : err?.response?.data?.detail || "Upload failed. Please try again.";
      toast({ title: "Upload Failed", description: msg, variant: "destructive" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-display font-bold text-gray-900">Upload Prescription</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="text-center py-6">
            <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-3" />
            <p className="font-semibold text-gray-800 mb-1">Login Required</p>
            <p className="text-sm text-gray-500 mb-5">Please log in to securely upload your prescription.</p>
            <Button asChild className="bg-medical-600 hover:bg-medical-700 w-full">
              <Link to="/login" onClick={onClose}>Login / Sign Up</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div
              className="border-2 border-dashed border-medical-200 rounded-xl p-8 text-center cursor-pointer hover:border-medical-400 hover:bg-medical-50/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-10 w-10 text-medical-600" />
                  <p className="font-medium text-gray-700 text-sm">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-10 w-10 text-medical-300" />
                  <p className="font-medium text-gray-600 text-sm">Click to upload prescription</p>
                  <p className="text-xs text-gray-400">JPG, PNG, PDF — max 5MB</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={handleFileChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., quantity needed, preferred brand…"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-400 resize-none"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={!file || isPending}
              className="w-full bg-medical-600 hover:bg-medical-700 h-12 rounded-xl shadow-lg shadow-medical-500/20"
            >
              {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading…</> : <><Upload className="h-4 w-4 mr-2" /> Upload Prescription</>}
            </Button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};

const PrescriptionBanner = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-medical-600 to-medical-400 px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-medical-500/30"
          >
            {/* Decorative blobs */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

            <div className="relative text-white space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-6 w-6" />
                <span className="text-sm font-semibold uppercase tracking-wider opacity-80">Prescription Required?</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold">Upload Your Prescription</h2>
              <p className="text-white/80 text-sm max-w-lg">
                Snap a photo or upload a PDF of your prescription. Our certified pharmacist reviews it and prepares your order within minutes.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-xs font-medium opacity-90">
                <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" />100% Secure</span>
                <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" />Pharmacist Verified</span>
                <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4" />GDPR Compliant</span>
              </div>
            </div>

            <div className="relative flex-shrink-0">
              <Button
                size="lg"
                onClick={() => setOpen(true)}
                className="bg-white text-medical-700 hover:bg-medical-50 font-bold shadow-xl px-8 h-14 rounded-2xl transition-all hover:-translate-y-0.5"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Now
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {open && <PrescriptionModal onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

export default PrescriptionBanner;
