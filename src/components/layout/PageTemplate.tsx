
import React from "react";
import Layout from "./Layout";
import { motion } from "framer-motion";

interface PageTemplateProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const PageTemplate: React.FC<PageTemplateProps> = ({ 
  title, 
  subtitle, 
  children 
}) => {
  return (
    <Layout>
      <div className="bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-gray-600 mb-8">
                {subtitle}
              </p>
            )}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
              {children}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default PageTemplate;
