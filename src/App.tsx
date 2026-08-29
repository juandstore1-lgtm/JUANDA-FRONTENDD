/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Catalogs from "./pages/Catalogs";
import StoreCatalog from "./pages/StoreCatalog";
import ProductDetail from "./pages/ProductDetail";


import Wholesale from "./pages/Wholesale";
import Locations from "./pages/Locations";

import MysteryBox from "./pages/MysteryBox";
import Contest from "./pages/Contest";
import Raffles from "./pages/Raffles";
import RaffleDetail from "./pages/RaffleDetail";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import AdminLayout from "./admin/layouts/AdminLayout";
import AdminLogin from "./admin/pages/AdminLogin";
import Dashboard from "./admin/pages/Dashboard";
import ProductsAdmin from "./admin/pages/ProductsAdmin";
import CategoriesAdmin from "./admin/pages/CategoriesAdmin";
import StoresAdmin from "./admin/pages/StoresAdmin";
import UsersAdmin from "./admin/pages/UsersAdmin";
import ContestsAdmin from "./admin/pages/ContestsAdmin";
import HomeAdmin from "./admin/pages/HomeAdmin";
import RafflesAdmin from "./admin/pages/RafflesAdmin";
import RaffleDashboardAdmin from "./admin/pages/RaffleDashboardAdmin";
import Logo from "./components/Logo";
import SmokeBackground from "./components/SmokeBackground";

function InitialLoader({ onComplete }: { onComplete: () => void; key?: string }) {
  useEffect(() => {
    // Intro total: 2.5 segundos.
    // Logo aparece lento → se queda → a los 2.0s el contenedor hace fade-out (0.5s) = 2.5s exactos.
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden select-none"
    >
      {/* Z-1: Procedural Organic Volumetric Canvas Smoke Background */}
      <SmokeBackground className="absolute inset-0 z-1" />

      {/* Z-2: Logo — aparece lentamente y se queda visible hasta que el contenedor desaparece */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: "easeInOut", delay: 0.1 }}
        className="relative z-2 flex items-center justify-center pointer-events-none"
      >
        <Logo className="h-52 md:h-72" />
      </motion.div>

      {/* Z-3: "Saltar" (Skip) Pill Button on Bottom Right */}
      <button
        onClick={onComplete}
        className="absolute bottom-6 right-6 z-3 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 border border-white/20 rounded-full hover:border-white hover:text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm cursor-pointer"
      >
        SALTAR
      </button>
    </motion.div>
  );
}

function MainApp() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && !isAdminRoute && <InitialLoader key="loader" onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      
      {(!loading || isAdminRoute) && (
        <Routes>
          {/* Public Routes */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalogs" element={<Catalogs />} />
                <Route path="/catalogs/:storeId" element={<StoreCatalog />} />
                <Route path="/product/:productId" element={<ProductDetail />} />


                <Route path="/mayorista" element={<Wholesale />} />
                <Route path="/ubicaciones" element={<Locations />} />

                <Route path="/caja-misteriosa" element={<MysteryBox />} />
                <Route path="/concursos" element={<Contest />} />
                <Route path="/rifas" element={<Raffles />} />
                <Route path="/rifas/:id" element={<RaffleDetail />} />
              </Routes>
            </Layout>
          } />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsAdmin />} />
            <Route path="categories" element={<CategoriesAdmin />} />
            <Route path="stores" element={<StoresAdmin />} />
            <Route path="users" element={<UsersAdmin />} />
            <Route path="contests" element={<ContestsAdmin />} />
            <Route path="raffles" element={<RafflesAdmin />} />
            <Route path="raffles/:id" element={<RaffleDashboardAdmin />} />
            <Route path="home" element={<HomeAdmin />} />
          </Route>
        </Routes>
      )}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <CartProvider>
            <MainApp />
          </CartProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}
