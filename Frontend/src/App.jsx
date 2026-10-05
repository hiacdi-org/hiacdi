import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { ADMIN_BASE } from "./adminPath";
import Layout from "./components/layout/Layout";
import PageLoader from "./components/ui/PageLoader";
import { ApplicationWindowProvider } from "./context/ApplicationWindowContext";
import { UserAuthProvider } from "./context/UserAuthContext";
import About from "./pages/About";
import AccountDashboard from "./pages/AccountDashboard";
import AuthCallback from "./pages/AuthCallback";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import Faqs from "./pages/Faqs";
import Apply from "./pages/Apply";
import Community from "./pages/Community";
import Corporate from "./pages/Corporate";
import CourseCategory from "./pages/CourseCategory";
import CourseProgram from "./pages/CourseProgram";
import Courses from "./pages/Courses";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Verify from "./pages/Verify";
import VerifyConfirm from "./pages/VerifyConfirm";
import Programmes from "./pages/Programmes";
import ProgrammeGroup from "./pages/ProgrammeGroup";
import ProgrammeItem from "./pages/ProgrammeItem";
import HubLanding, { HubArticle } from "./pages/Hub";

const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminApplications = lazy(() => import("./pages/AdminApplications"));
const AdminApplicants = lazy(() => import("./pages/AdminApplicants"));
const AdminCalls = lazy(() => import("./pages/AdminCalls"));
const AdminGraduates = lazy(() => import("./pages/AdminGraduates"));
const AdminContacts = lazy(() => import("./pages/AdminContacts"));
const AdminBroadcast = lazy(() => import("./pages/AdminBroadcast"));
const AdminVisitors = lazy(() => import("./pages/AdminVisitors"));
const AdminIntakes = lazy(() => import("./pages/AdminIntakes"));
const AdminDatabase = lazy(() => import("./pages/AdminDatabase"));
const AdminStaffTokens = lazy(() => import("./pages/AdminStaffTokens"));
const AdminCertificates = lazy(() => import("./pages/AdminCertificates"));
const AdminProgrammes = lazy(() => import("./pages/AdminProgrammes"));
const AdminContent = lazy(() => import("./pages/AdminContent"));
const AdminSite = lazy(() => import("./pages/AdminSite"));

function adminElement(element) {
  return (
    <Suspense fallback={<PageLoader overlay label="Loading..." />}>
      {element}
    </Suspense>
  );
}

export default function App() {
  useEffect(() => {
    const path = window.location.pathname;

    const seo = {
      "/": {
        title: "HIACDI | Humanity, Inclusion and Advancement",
        description:
          "HIACDI | Humanity, Inclusion and Advancement Community Development Initiative."
      },

      "/about": {
        title: "About HIACDI | Humanity, Inclusion and Advancement",
        description:
          "Learn about HIACDI, its mission, vision and commitment to community development, inclusion and advancement."
      },

      "/about/careers": {
        title: "Careers | HIACDI",
        description:
          "Explore career and opportunity information at HIACDI."
      },

      "/about/faqs": {
        title: "FAQs | HIACDI",
        description:
          "Find answers to frequently asked questions about HIACDI, its programs and services."
      },

      "/courses": {
        title: "Courses | HIACDI",
        description:
          "Explore courses and training programs offered through HIACDI."
      },

      "/apply": {
        title: "Apply | HIACDI",
        description:
          "Apply for HIACDI programs and training opportunities."
      },

      "/verify": {
        title: "Certificate Verification | HIACDI",
        description:
          "Verify a certificate issued through HIACDI."
      },

      "/contact": {
        title: "Contact HIACDI",
        description:
          "Contact HIACDI for information, support, partnerships and community development inquiries."
      },

      "/community": {
        title: "Community | HIACDI",
        description:
          "Discover HIACDI community initiatives, activities and development programs."
      },

      "/corporate": {
        title: "Corporate | HIACDI",
        description:
          "Explore corporate information, partnerships and opportunities with HIACDI."
      }
    };

    const current = seo[path] || {
      title: "HIACDI | Humanity, Inclusion and Advancement",
      description:
        "HIACDI | Humanity, Inclusion and Advancement Community Development Initiative."
    };

    document.title = current.title;

    let description = document.querySelector('meta[name="description"]');

    if (!description) {
      description = document.createElement("meta");
      description.setAttribute("name", "description");
      document.head.appendChild(description);
    }

    description.setAttribute("content", current.description);
  }, []);

  return (
    <ApplicationWindowProvider>
      <UserAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route
              path="/courses/:categorySlug"
              element={<CourseCategory />}
            />
            <Route
              path="/courses/:categorySlug/:programSlug"
              element={<CourseProgram />}
            />

            <Route path="/apply" element={<Apply />} />

            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/account" element={<AccountDashboard />} />

            <Route path="/verify" element={<Verify />} />
            <Route
              path="/verify/confirm/:token"
              element={<VerifyConfirm />}
            />
            <Route path="/verify/:certificateId" element={<Verify />} />

            <Route path="/programmes" element={<Programmes />} />
            <Route path="/programmes/:groupSlug" element={<ProgrammeGroup />} />
            <Route path="/programmes/:groupSlug/:itemSlug" element={<ProgrammeItem />} />

            <Route path="/projects" element={<HubLanding hub="projects" />} />
            <Route path="/projects/:slug" element={<HubArticle hub="projects" />} />
            <Route path="/news" element={<HubLanding hub="news" />} />
            <Route path="/news/:slug" element={<HubArticle hub="news" />} />
            <Route path="/resources" element={<HubLanding hub="resources" />} />
            <Route path="/resources/:slug" element={<HubArticle hub="resources" />} />
            <Route path="/get-involved" element={<HubLanding hub="get-involved" />} />
            <Route path="/get-involved/:slug" element={<HubArticle hub="get-involved" />} />

            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/about/careers" element={<Careers />} />
            <Route path="/about/faqs" element={<Faqs />} />
            <Route path="/about/:slug" element={<HubArticle hub="about" />} />
            <Route path="/corporate" element={<Corporate />} />
            <Route path="/community" element={<Community />} />

            <Route path="*" element={<NotFound />} />
          </Route>

          <Route
            path="/admin/login"
            element={<Navigate to={`${ADMIN_BASE}/login`} replace />}
          />
          <Route path="/admin" element={<Navigate to={ADMIN_BASE} replace />} />

          <Route
            path={`${ADMIN_BASE}/login`}
            element={adminElement(<AdminLogin />)}
          />

          <Route
            path={ADMIN_BASE}
            element={adminElement(<AdminLayout />)}
          >
            <Route index element={<AdminDashboard />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="applicants" element={<AdminApplicants />} />
            <Route path="calls" element={<AdminCalls />} />
            <Route path="graduates" element={<AdminGraduates />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="broadcast" element={<AdminBroadcast />} />
            <Route path="visitors" element={<AdminVisitors />} />
            <Route path="intakes" element={<AdminIntakes />} />
            <Route path="database" element={<AdminDatabase />} />
            <Route path="staff-tokens" element={<AdminStaffTokens />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="programmes" element={<AdminProgrammes />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="site" element={<AdminSite />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </UserAuthProvider>
    </ApplicationWindowProvider>
  );
}

function NotFound() {
  return (
    <section className="px-5 py-20 text-center">
      <h1 className="font-heading text-3xl font-bold text-navy">
        Page not found
      </h1>

      <p className="mt-3 text-muted">
        That address does not exist on HIACDI.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <Link to="/" className="font-semibold text-gold">
          Home
        </Link>
      </div>
    </section>
  );
}
