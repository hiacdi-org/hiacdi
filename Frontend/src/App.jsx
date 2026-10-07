import { Suspense, lazy } from "react";

import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { ADMIN_BASE } from "./adminPath";

import Layout from "./components/layout/Layout";
import PageLoader from "./components/ui/PageLoader";
import SEO from "./components/SEO.jsx";

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

const AdminLayout = lazy(
  () => import("./components/admin/AdminLayout")
);

const AdminLogin = lazy(
  () => import("./pages/AdminLogin")
);

const AdminDashboard = lazy(
  () => import("./pages/AdminDashboard")
);

const AdminApplications = lazy(
  () => import("./pages/AdminApplications")
);

const AdminApplicants = lazy(
  () => import("./pages/AdminApplicants")
);

const AdminCalls = lazy(
  () => import("./pages/AdminCalls")
);

const AdminGraduates = lazy(
  () => import("./pages/AdminGraduates")
);

const AdminContacts = lazy(
  () => import("./pages/AdminContacts")
);

const AdminBroadcast = lazy(
  () => import("./pages/AdminBroadcast")
);

const AdminVisitors = lazy(
  () => import("./pages/AdminVisitors")
);

const AdminIntakes = lazy(
  () => import("./pages/AdminIntakes")
);

const AdminDatabase = lazy(
  () => import("./pages/AdminDatabase")
);

const AdminStaffTokens = lazy(
  () => import("./pages/AdminStaffTokens")
);

const AdminCertificates = lazy(
  () => import("./pages/AdminCertificates")
);

const AdminProgrammes = lazy(
  () => import("./pages/AdminProgrammes")
);

const AdminContent = lazy(
  () => import("./pages/AdminContent")
);

const AdminSite = lazy(
  () => import("./pages/AdminSite")
);

function adminElement(element) {
  return (
    <Suspense
      fallback={
        <PageLoader
          overlay
          label="Loading..."
        />
      }
    >
      {element}
    </Suspense>
  );
}

/*
|--------------------------------------------------------------------------
| SEO
|--------------------------------------------------------------------------
*/

function getSEO(pathname) {
  const defaultSEO = {
    title:
      "HIACDI | Humanity, Inclusion and Advancement Community Development Initiative",

    description:
      "HIACDI advances health, education, youth empowerment, gender equality, protection, inclusion and sustainable community development.",

    type: "website",

    noIndex: false,
  };

  const seo = {
    "/": {
      title:
        "HIACDI | Humanity, Inclusion and Advancement Community Development Initiative",

      description:
        "HIACDI is a community-based organization advancing health, education, youth empowerment, gender equality, protection, inclusion and sustainable community development.",
    },

    "/about": {
      title:
        "About HIACDI | Humanity, Inclusion and Advancement Community Development Initiative",

      description:
        "Learn about HIACDI, our mission, vision and commitment to health, education, protection, inclusion, youth empowerment and sustainable community development.",
    },

    "/about/careers": {
      title:
        "Careers & Opportunities | HIACDI",

      description:
        "Explore career, volunteering and professional opportunities with HIACDI and contribute to inclusive community development.",
    },

    "/about/faqs": {
      title:
        "Frequently Asked Questions | HIACDI",

      description:
        "Find answers to frequently asked questions about HIACDI, our programmes, services, training and community development work.",
    },

    "/programmes": {
      title:
        "Our Programmes | HIACDI",

      description:
        "Explore HIACDI programmes covering health and wellbeing, protection, gender and inclusion, education, youth empowerment and community development.",
    },

    "/community": {
      title:
        "Community Development | HIACDI",

      description:
        "Discover HIACDI community initiatives supporting inclusion, empowerment, wellbeing and sustainable community advancement.",
    },

    "/projects": {
      title:
        "Projects & Initiatives | HIACDI",

      description:
        "Explore HIACDI projects and initiatives supporting health, education, protection, inclusion, youth empowerment and sustainable community development.",
    },

    "/news": {
      title:
        "News & Updates | HIACDI",

      description:
        "Read the latest HIACDI news, community updates, activities, events and development initiatives.",
    },

    "/resources": {
      title:
        "Resources | HIACDI",

      description:
        "Access HIACDI resources, publications and information supporting learning, inclusion and community development.",
    },

    "/get-involved": {
      title:
        "Get Involved | HIACDI",

      description:
        "Learn how you can support HIACDI through partnerships, volunteering, participation and community development opportunities.",
    },

    "/contact": {
      title:
        "Contact HIACDI | Humanity, Inclusion and Advancement",

      description:
        "Contact HIACDI for information, partnerships, programmes, community development support and other inquiries.",
    },

    "/courses": {
      title:
        "Courses & Training | HIACDI Tech Hub",

      description:
        "Explore practical courses and training opportunities offered through HIACDI Tech Hub.",
    },

    "/apply": {
      title:
        "Apply for Training | HIACDI Tech Hub",

      description:
        "Apply for available HIACDI Tech Hub courses and training opportunities.",
    },

    "/verify": {
      title:
        "Certificate Verification | HIACDI Tech Hub",

      description:
        "Verify a certificate issued through HIACDI Tech Hub.",
    },

    "/corporate": {
      title:
        "Corporate & Partnerships | HIACDI",

      description:
        "Explore HIACDI corporate information, partnerships and opportunities for collaboration.",
    },

    /*
    |--------------------------------------------------------------------------
    | Private pages
    |--------------------------------------------------------------------------
    */

    "/login": {
      title:
        "Login | HIACDI Tech Hub",

      description:
        "Sign in to your HIACDI Tech Hub account.",

      noIndex: true,
    },

    "/register": {
      title:
        "Create an Account | HIACDI Tech Hub",

      description:
        "Create an account to access HIACDI Tech Hub services and training.",

      noIndex: true,
    },

    "/forgot-password": {
      title:
        "Forgot Password | HIACDI Tech Hub",

      description:
        "Reset your HIACDI Tech Hub account password.",

      noIndex: true,
    },

    "/reset-password": {
      title:
        "Reset Password | HIACDI Tech Hub",

      description:
        "Reset your HIACDI Tech Hub account password.",

      noIndex: true,
    },

    "/account": {
      title:
        "My Account | HIACDI Tech Hub",

      description:
        "Manage your HIACDI Tech Hub account.",

      noIndex: true,
    },

    "/auth/callback": {
      title:
        "Authentication | HIACDI Tech Hub",

      description:
        "Authentication page for HIACDI Tech Hub.",

      noIndex: true,
    },
  };

  if (seo[pathname]) {
    return {
      ...defaultSEO,
      ...seo[pathname],
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Dynamic public routes
  |--------------------------------------------------------------------------
  */

  if (pathname.startsWith("/programmes/")) {
    return {
      ...defaultSEO,

      title:
        "HIACDI Programme | Community Development & Inclusion",

      description:
        "Explore HIACDI programmes supporting health, education, protection, gender equality, youth empowerment, inclusion and community development.",
    };
  }

  if (pathname.startsWith("/projects/")) {
    return {
      ...defaultSEO,

      title:
        "HIACDI Project | Community Development Initiative",

      description:
        "Learn about HIACDI projects and initiatives supporting inclusive and sustainable community development.",
    };
  }

  if (pathname.startsWith("/news/")) {
    return {
      ...defaultSEO,

      title:
        "HIACDI News & Updates",

      description:
        "Read HIACDI news, activities, events and community development updates.",
    };
  }

  if (pathname.startsWith("/resources/")) {
    return {
      ...defaultSEO,

      title:
        "HIACDI Resource",

      description:
        "Explore HIACDI resources and information supporting community development, learning and inclusion.",
    };
  }

  if (pathname.startsWith("/get-involved/")) {
    return {
      ...defaultSEO,

      title:
        "Get Involved with HIACDI",

      description:
        "Discover ways to participate, volunteer, partner and support HIACDI community development initiatives.",
    };
  }

  if (pathname.startsWith("/courses/")) {
    return {
      ...defaultSEO,

      title:
        "HIACDI Tech Hub Course",

      description:
        "Explore practical courses and training opportunities available through HIACDI Tech Hub.",
    };
  }

  if (pathname.startsWith("/verify/")) {
    return {
      ...defaultSEO,

      title:
        "Certificate Verification | HIACDI Tech Hub",

      description:
        "Verify a certificate issued by HIACDI Tech Hub.",
    };
  }

  if (pathname.startsWith("/about/")) {
    return {
      ...defaultSEO,

      title:
        "About HIACDI",

      description:
        "Learn more about HIACDI and its community development work.",
    };
  }

  return defaultSEO;
}

function SEOManager() {
  const location = useLocation();

  const pathname =
    location.pathname.length > 1
      ? location.pathname.replace(/\/+$/, "")
      : "/";

  const seo = getSEO(pathname);

  return (
    <SEO
      title={seo.title}
      description={seo.description}
      path={location.pathname}
      type={seo.type}
      noIndex={seo.noIndex}
    />
  );
}

/*
|--------------------------------------------------------------------------
| Application
|--------------------------------------------------------------------------
*/

export default function App() {
  return (
    <ApplicationWindowProvider>
      <UserAuthProvider>
        <BrowserRouter>

          <SEOManager />

          <Routes>

            <Route element={<Layout />}>

              <Route
                path="/"
                element={<Home />}
              />

              <Route
                path="/courses"
                element={<Courses />}
              />

              <Route
                path="/courses/:categorySlug"
                element={<CourseCategory />}
              />

              <Route
                path="/courses/:categorySlug/:programSlug"
                element={<CourseProgram />}
              />

              <Route
                path="/apply"
                element={<Apply />}
              />

              <Route
                path="/register"
                element={<Register />}
              />

              <Route
                path="/login"
                element={<Login />}
              />

              <Route
                path="/forgot-password"
                element={<ForgotPassword />}
              />

              <Route
                path="/reset-password"
                element={<ResetPassword />}
              />

              <Route
                path="/auth/callback"
                element={<AuthCallback />}
              />

              <Route
                path="/account"
                element={<AccountDashboard />}
              />

              <Route
                path="/verify"
                element={<Verify />}
              />

              <Route
                path="/verify/confirm/:token"
                element={<VerifyConfirm />}
              />

              <Route
                path="/verify/:certificateId"
                element={<Verify />}
              />

              <Route
                path="/programmes"
                element={<Programmes />}
              />

              <Route
                path="/programmes/:groupSlug"
                element={<ProgrammeGroup />}
              />

              <Route
                path="/programmes/:groupSlug/:itemSlug"
                element={<ProgrammeItem />}
              />

              <Route
                path="/projects"
                element={
                  <HubLanding hub="projects" />
                }
              />

              <Route
                path="/projects/:slug"
                element={
                  <HubArticle hub="projects" />
                }
              />

              <Route
                path="/news"
                element={
                  <HubLanding hub="news" />
                }
              />

              <Route
                path="/news/:slug"
                element={
                  <HubArticle hub="news" />
                }
              />

              <Route
                path="/resources"
                element={
                  <HubLanding hub="resources" />
                }
              />

              <Route
                path="/resources/:slug"
                element={
                  <HubArticle hub="resources" />
                }
              />

              <Route
                path="/get-involved"
                element={
                  <HubLanding hub="get-involved" />
                }
              />

              <Route
                path="/get-involved/:slug"
                element={
                  <HubArticle hub="get-involved" />
                }
              />

              <Route
                path="/contact"
                element={<Contact />}
              />

              <Route
                path="/about"
                element={<About />}
              />

              <Route
                path="/about/careers"
                element={<Careers />}
              />

              <Route
                path="/about/faqs"
                element={<Faqs />}
              />

              <Route
                path="/about/:slug"
                element={
                  <HubArticle hub="about" />
                }
              />

              <Route
                path="/corporate"
                element={<Corporate />}
              />

              <Route
                path="/community"
                element={<Community />}
              />

              <Route
                path="*"
                element={<NotFound />}
              />

            </Route>

            {/* Admin redirects */}

            <Route
              path="/admin/login"
              element={
                <Navigate
                  to={`${ADMIN_BASE}/login`}
                  replace
                />
              }
            />

            <Route
              path="/admin"
              element={
                <Navigate
                  to={ADMIN_BASE}
                  replace
                />
              }
            />

            {/* Admin login */}

            <Route
              path={`${ADMIN_BASE}/login`}
              element={
                adminElement(
                  <AdminLogin />
                )
              }
            />

            {/* Admin application */}

            <Route
              path={ADMIN_BASE}
              element={
                adminElement(
                  <AdminLayout />
                )
              }
            >

              <Route
                index
                element={<AdminDashboard />}
              />

              <Route
                path="applications"
                element={<AdminApplications />}
              />

              <Route
                path="applicants"
                element={<AdminApplicants />}
              />

              <Route
                path="calls"
                element={<AdminCalls />}
              />

              <Route
                path="graduates"
                element={<AdminGraduates />}
              />

              <Route
                path="contacts"
                element={<AdminContacts />}
              />

              <Route
                path="broadcast"
                element={<AdminBroadcast />}
              />

              <Route
                path="visitors"
                element={<AdminVisitors />}
              />

              <Route
                path="intakes"
                element={<AdminIntakes />}
              />

              <Route
                path="database"
                element={<AdminDatabase />}
              />

              <Route
                path="staff-tokens"
                element={<AdminStaffTokens />}
              />

              <Route
                path="certificates"
                element={<AdminCertificates />}
              />

              <Route
                path="programmes"
                element={<AdminProgrammes />}
              />

              <Route
                path="content"
                element={<AdminContent />}
              />

              <Route
                path="site"
                element={<AdminSite />}
              />

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

        <Link
          to="/"
          className="font-semibold text-gold"
        >
          Home
        </Link>

      </div>

    </section>
  );
}
