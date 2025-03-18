
import { ReactNode, Suspense } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { motion } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-grow"
      >
        <Suspense fallback={
          <div className="w-full h-[50vh] flex items-center justify-center">
            <div className="text-blue-500 text-xl animate-pulse">Loading MediSwift...</div>
          </div>
        }>
          {children}
        </Suspense>
      </motion.main>
      <Footer />
    </div>
  );
};

export default Layout;
