import { useEffect, useState } from "react";
import Countdown from "../ui/Countdown";
import ApplyCta from "../ui/ApplyCta";
import { useApplicationWindow } from "../../context/ApplicationWindowContext";

const openMessage = "New intake alert! HIACDI Tech Hub bootcamps are now open";
const closedMessage =
  "New intake alert! HIACDI Tech Hub bootcamps are now closed for Application Kindly Keep your eye on our Site";

export default function TopBar() {
  const { isOpen, globalOpen, openAt, closeAt, reason, refresh, openSummary } = useApplicationWindow();
  const [showClose, setShowClose] = useState(false);
  const partial = isOpen && !globalOpen;
  const canRotate = Boolean(isOpen && closeAt);

  useEffect(() => {
    if (!canRotate) {
      setShowClose(false);
      return undefined;
    }
    const id = setInterval(() => setShowClose((current) => !current), 4500);
    return () => clearInterval(id);
  }, [canRotate]);

  const headline = partial
    ? `New intake alert! ${[...(openSummary?.areas || []), ...(openSummary?.courses || [])].join(", ") || "Selected courses"} ${
        (openSummary?.areas || []).length + (openSummary?.courses || []).length === 1 ? "is" : "are"
      } now open`
    : openMessage;

  return (
    <div className="w-full bg-navy-dark px-3 py-2 text-center text-xs leading-5 text-white sm:px-5 sm:text-[13px]">
      {isOpen ? (
        <div className="mx-auto flex flex-col items-center justify-center gap-1 sm:flex-row sm:flex-wrap sm:gap-x-2">
          <p className="max-w-full px-1">
            <span className="sm:hidden">Bootcamps are open. </span>
            <span className="hidden sm:inline">{showClose && closeAt ? "Applications close in:" : headline}</span>
            {closeAt && showClose ? (
              <span className="hidden sm:inline">
                <Countdown target={closeAt} size="sm" warnAtDays={5} className="ml-1 inline text-gold" onReached={refresh} />
              </span>
            ) : null}
          </p>
          <ApplyCta className="font-semibold text-gold underline">Apply now</ApplyCta>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:flex-wrap sm:gap-x-2">
          <span className="max-w-full px-1 sm:hidden">Applications are closed. Watch this site for the next intake.</span>
          <span className="hidden max-w-full px-1 sm:inline">{closedMessage}</span>
          {reason === "not-yet-open" && openAt ? (
            <span className="flex flex-wrap items-center justify-center gap-1.5">
              <span className="text-white/70">Opens in:</span>
              <Countdown target={openAt} size="sm" className="text-gold" onReached={refresh} />
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
