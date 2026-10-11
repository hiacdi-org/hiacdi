import { useEffect, useState } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import BookingModal from "../booking/BookingModal";
import BrandTheme from "../cms/BrandTheme";
import ApplicationDeadlineBar from "./ApplicationDeadlineBar";
import AnnouncementBar from "./AnnouncementBar";
import Footer from "./Footer";
import Navbar from "./Navbar";
import SearchModal from "./SearchModal";
import TopBar from "./TopBar";
import ServerStatusBanner from "./ServerStatusBanner";
import VisitTracker from "./VisitTracker";
import { PublicCmsProvider } from "../../context/PublicCmsContext";

export default function Layout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = () => setBookingOpen(true);
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const applyMode = pathname === "/apply";

  useEffect(() => {
    if (searchParams.get("book") !== "1") return;
    setBookingOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete("book");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  return (
    <PublicCmsProvider>
    <div
      className={`flex min-h-screen w-full flex-col overflow-x-clip bg-white ${
        applyMode ? "pb-0" : "pb-16"
      }`}
    >
      <ServerStatusBanner />
      {applyMode ? null : <TopBar />}
      {applyMode ? null : <AnnouncementBar />}
      {applyMode ? null : <Navbar onSearch={() => setSearchOpen(true)} onBook={openBooking} />}
      <BrandTheme />
      <main className="w-full flex-1">
        <Outlet context={{ onBook: openBooking }} />
      </main>
      <VisitTracker />
      {applyMode ? null : <Footer />}
      {applyMode ? null : <ApplicationDeadlineBar />}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
    </PublicCmsProvider>
  );
}
