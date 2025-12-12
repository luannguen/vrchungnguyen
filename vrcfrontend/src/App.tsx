import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import SEOHelmet from "@/components/common/SEOHelmet";

// Public pages
import MainLayout from "./components/layouts/MainLayout";
import Index from "./pages/Index";
import StaticPage from "./pages/StaticPage";
// import About from "./pages/About"; // Replaced by dynamic StaticPage
import Products from "./pages/Products";
import Projects from "./pages/Projects";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail"; // Added
import Installation from "./pages/Installation";
import Maintenance from "./pages/Maintenance";
import Repair from "./pages/Repair";
import Consulting from "./pages/Consulting";
import ServiceSupport from "./pages/ServiceSupport";
import Technologies from "./pages/Technologies";
import EnergyEfficiency from "./pages/technologies/EnergyEfficiency";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Contact from "./pages/Contact";
import TeamPage from "./pages/TeamPage";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import ProjectDetail from "./pages/ProjectDetail";
import NotFound from "./pages/NotFound";

// Auth & Admin pages
// Auth & Admin pages - REMOVED during migration to backend
// import Login from "./modules/user/pages/LoginPage";
// import AdminLayout from "./components/layouts/AdminLayout";
// import ProtectedRoute from "./modules/user/components/ProtectedRoute";
// import Profile from "./modules/user/pages/ProfilePage";
// import RoleManagement from "./pages/admin/RoleManagement";
// import UserManagement from "./modules/user/pages/UserManagementPage";
// import { AuthProvider } from "./modules/user/context/AuthContext";

// Legal pages
import Privacy from "./pages/legal/Privacy";
import Terms from "./pages/legal/Terms";
import Cookies from "./pages/legal/Cookies";
import Sitemap from "./pages/legal/Sitemap";

// Data & Resources pages
import Statistics from "./pages/data/Statistics";
import Tools from "./pages/data/Tools";
import ResourceCategory from "./pages/data/ResourceCategory";
import ResourceDetail from "./pages/data/ResourceDetail";

// Publication pages
import Publications from "./pages/publications/Index";
import InverterTechnology from "./pages/publications/InverterTechnology";
import HeatRecoverySolutions from "./pages/publications/HeatRecoverySolutions";
import GreenBuildingStandards from "./pages/publications/GreenBuildingStandards";
import EnergyEfficiencyReport from "./pages/publications/EnergyEfficiencyReport";

// Product pages
import IndustrialProducts from "./pages/products/Industrial";
import CommercialProducts from "./pages/products/Commercial";
import ResidentialProducts from "./pages/products/Residential";
import ColdStorageProducts from "./pages/products/ColdStorage";
import AuxiliaryProducts from "./pages/products/Auxiliary";

// Project pages
import IndustrialProjects from "./pages/projects/Industrial";
import CommercialProjects from "./pages/projects/Commercial";
import SpecializedProjects from "./pages/projects/Specialized";
import ProjectCategory from "./pages/ProjectCategory";


import SearchResults from "./pages/SearchResults";

const App = () => (
  <TooltipProvider>
    <HelmetProvider>
      <SEOHelmet />
      <BrowserRouter>
        {/* <AuthProvider> */}
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Index />} />
            <Route path="about" element={<StaticPage slug="about-us" />} />
            <Route path="intro" element={<StaticPage slug="intro" />} />
            <Route path="page/:slug" element={<StaticPage />} />
            <Route path="products" element={<Products />} />
            <Route path="products/industrial" element={<IndustrialProducts />} />
            <Route path="products/commercial" element={<CommercialProducts />} />
            <Route path="products/residential" element={<ResidentialProducts />} />
            <Route path="products/cold-storage" element={<ColdStorageProducts />} />
            <Route path="products/auxiliary" element={<AuxiliaryProducts />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/category/:slug" element={<ProjectCategory />} /> {/* Dynamic Category Route */}
            <Route path="projects/industrial" element={<IndustrialProjects />} />
            <Route path="projects/commercial" element={<CommercialProjects />} />
            <Route path="projects/specialized" element={<SpecializedProjects />} />
            <Route path="services" element={<Services />} />
            <Route path="services/:slug" element={<ServiceDetail />} /> {/* Dynamic Service Detail */}
            <Route path="installation" element={<Installation />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="repair" element={<Repair />} />
            <Route path="consulting" element={<Consulting />} />
            <Route path="service-support" element={<ServiceSupport />} />
            <Route path="technologies" element={<Technologies />} />
            <Route path="technologies/energy-efficiency" element={<EnergyEfficiency />} />
            <Route path="technology" element={<Navigate to="/technologies" replace />} />
            <Route path="news" element={<News />} />
            <Route path="news/category/:category" element={<News />} />
            <Route path="news/tag/:tag" element={<News />} />
            <Route path="news/:slug" element={<NewsDetail />} />
            <Route path="events" element={<Events />} />
            <Route path="event-details/:id" element={<EventDetail />} />
            <Route path="project-details/:id" element={<ProjectDetail />} />
            <Route path="search" element={<SearchResults />} />
            <Route path="publications" element={<Publications />} />
            <Route path="publications/inverter-technology" element={<InverterTechnology />} />
            <Route path="publications/heat-recovery-solutions" element={<HeatRecoverySolutions />} />
            <Route path="publications/green-building-standards" element={<GreenBuildingStandards />} />
            <Route path="publications/energy-efficiency-report" element={<EnergyEfficiencyReport />} />
            <Route path="contact" element={<Contact />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="legal/privacy" element={<Privacy />} />
            <Route path="legal/terms" element={<Terms />} />
            <Route path="legal/cookies" element={<Cookies />} />
            <Route path="legal/sitemap" element={<Sitemap />} />

            {/* Dynamic Data Resources Routes */}
            <Route path="data/statistics" element={<Statistics />} />
            <Route path="data/tools" element={<Tools />} />
            <Route path="data/:slug" element={<ResourceCategory />} />
            <Route path="data/:category/:slug" element={<ResourceDetail />} />

            {/* <Route path="login" element={<Login />} /> */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Protected Routes - REMOVED
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/profile" replace />} />
              <Route path="profile" element={<Profile />} />
              <Route path="roles" element={<RoleManagement />} />
              <Route path="users" element={<UserManagement />} />
             
            </Route>
          </Route> */}

        </Routes>
        {/* </AuthProvider> */}
        <Toaster />
        <Sonner />
      </BrowserRouter>
    </HelmetProvider>
  </TooltipProvider >
);

export default App;
