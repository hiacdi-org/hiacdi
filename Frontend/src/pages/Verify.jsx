import { useParams } from "react-router-dom";
import VerifyCertificateCard from "../components/verify/VerifyCertificateCard";

export default function Verify() {
  const { certificateId } = useParams();
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm font-semibold text-gold">Certificate verification</p>
      <div className="mt-4">
        <VerifyCertificateCard initialNumber={certificateId || ""} />
      </div>
    </section>
  );
}
