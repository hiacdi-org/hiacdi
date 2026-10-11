import Countdown from "../ui/Countdown";
import { useApplicationWindow } from "../../context/ApplicationWindowContext";

const closedMessage = "Applications will open soon. Thank you for your patience.";

export default function ApplicationDeadlineBar() {
  const { isOpen, globalOpen, closeAt, loading, refresh } = useApplicationWindow();

  if (loading) return null;

  if (!isOpen) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-40 w-full bg-navy-dark px-3 py-2 text-center text-xs leading-5 text-white sm:px-5 sm:text-[13px]">
        {closedMessage}
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 w-full bg-[#5d7086] px-3 py-2 text-center text-xs leading-5 text-white sm:px-5 sm:py-2.5 sm:text-sm">
      {closeAt ? (
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-1 sm:flex-row sm:flex-wrap sm:gap-x-3">
          <p>Application deadline:</p>
          <Countdown target={closeAt} size="sm" warnAtDays={5} className="text-gold" onReached={refresh} />
        </div>
      ) : (
        <p>
          {globalOpen
            ? "Course applications are open."
            : "Selected courses are open for application."}
        </p>
      )}
    </div>
  );
}
