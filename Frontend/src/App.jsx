import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { ADMIN_BASE } from "./adminPath";
import Layout from "./components/layout/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import PageLoader from "./components/ui/PageLoader";
import { ApplicationWindowProvider } from "./context/ApplicationWindowContext";
import { ServerReachabilityProvider } from "./context/ServerReachabilityContext";
import { UserAuthProvider } from "./context/UserAuthContext";
import Home from "./pages/Home";
import Verify from "./pages/Verify";

const About = lazy(() => import("./pages/About"));
const AccountDashboard = lazy(() => import("./pages/AccountDashboard"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Careers = lazy(() => import("./pages/Careers"));
const Contact = lazy(() => import("./pages/Contact"));
const Faqs = lazy(() => import("./pages/Faqs"));
const Apply = lazy(() => import("./pages/Apply"));
const Community = lazy(() => import("./pages/Community"));
const Corporate = lazy(() => import("./pages/Corporate"));
const CourseCategory = lazy(() => import("./pages/CourseCategory"));
const CourseProgram = lazy(() => import("./pages/CourseProgram"));
const Courses = lazy(() => import("./pages/Courses"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyConfirm = lazy(() => import("./pages/VerifyConfirm"));
const Programmes = lazy(() => import("./pages/Programmes"));
const ProgrammeGroup = lazy(() => import("./pages/ProgrammeGroup"));
const ProgrammeItem = lazy(() => import("./pages/ProgrammeItem"));
const HubLanding = lazy(() => import("./pages/Hub"));
const HubArticle = lazy(() => import("./pages/Hub").then((mod) => ({ default: mod.HubArticle })));

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

function page(element) {
  return <Suspense fallback={<PageSkeleton />}>{element}</Suspense>;
}

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-12">
      <div className="h-8 w-48 rounded bg-navy/10" />
      <div className="mt-4 h-24 rounded-2xl bg-navy/5" />
    </div>
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
    <ServerReachabilityProvider>
    <ApplicationWindowProvider>
      <UserAuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={page(<Courses />)} />
            <Route path="/courses/:categorySlug" element={page(<CourseCategory />)} />
            <Route path="/courses/:categorySlug/:programSlug" element={page(<CourseProgram />)} />
            <Route path="/apply" element={page(<Apply />)} />
            <Route path="/register" element={page(<Register />)} />
            <Route path="/login" element={page(<Login />)} />
            <Route path="/forgot-password" element={page(<ForgotPassword />)} />
            <Route path="/reset-password" element={page(<ResetPassword />)} />
            <Route path="/auth/callback" element={page(<AuthCallback />)} />
            <Route path="/account" element={page(<AccountDashboard />)} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/verify/confirm/:token" element={page(<VerifyConfirm />)} />
            <Route path="/verify/:certificateId" element={<Verify />} />
            <Route path="/programmes" element={page(<Programmes />)} />
            <Route path="/programmes/:groupSlug" element={page(<ProgrammeGroup />)} />
            <Route path="/programmes/:groupSlug/:itemSlug" element={page(<ProgrammeItem />)} />
            <Route path="/projects" element={page(<HubLanding hub="projects" />)} />
            <Route path="/projects/:slug" element={page(<HubArticle hub="projects" />)} />
            <Route path="/news" element={page(<HubLanding hub="news" />)} />
            <Route path="/news/:slug" element={page(<HubArticle hub="news" />)} />
            <Route path="/resources" element={page(<HubLanding hub="resources" />)} />
            <Route path="/resources/:slug" element={page(<HubArticle hub="resources" />)} />
            <Route path="/get-involved" element={page(<HubLanding hub="get-involved" />)} />
            <Route path="/get-involved/:slug" element={page(<HubArticle hub="get-involved" />)} />
            <Route path="/contact" element={page(<Contact />)} />
            <Route path="/about" element={page(<About />)} />
            <Route path="/about/careers" element={page(<Careers />)} />
            <Route path="/about/faqs" element={page(<Faqs />)} />
            <Route path="/about/:slug" element={page(<HubArticle hub="about" />)} />
            <Route path="/corporate" element={page(<Corporate />)} />
            <Route path="/community" element={page(<Community />)} />
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
        </ErrorBoundary>
      </BrowserRouter>
      </UserAuthProvider>
    </ApplicationWindowProvider>
    </ServerReachabilityProvider>
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
