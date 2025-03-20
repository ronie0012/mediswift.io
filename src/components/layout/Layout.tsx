
import { ReactNode, Suspense } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { motion } from "framer-motion";
import { ErrorBoundary } from 'react-error-boundary';

interface LayoutProps {
  children: ReactNode;
}

// Create a fallback component for the ErrorBoundary
const ErrorFallback = () => (
  <div className="w-full h-[50vh] flex items-center justify-center">
    <div className="text-blue-500 text-xl">Sorry, something went wrong. Please refresh the page.</div>
  </div>
);

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
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={
            <div className="w-full h-[50vh] flex items-center justify-center">
              <div className="text-blue-500 text-xl animate-pulse">Loading MediSwift...</div>
            </div>
          }>
            {children}
          </Suspense>
        </ErrorBoundary>
      </motion.main>
      <Footer />
    </div>
  );
};

export default Layout;
