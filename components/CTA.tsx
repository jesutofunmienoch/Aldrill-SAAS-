"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const Cta = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    setLoading(true);
    router.push("/companions/new");
  };

  return (
    <section className="cta-section relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-80 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="cta-badge">Start learning your way.</div>

      <h2 className="text-3xl font-bold">
        Build and Personalize Learning Companion
      </h2>
      <p>
        Pick a name, subject, voice, & personality — and start learning through
        voice conversations that feel natural and fun.
      </p>
      <img src="/images/cta.svg" alt="cta" width={362} height={232} />

      <button className="btn-primary flex items-center gap-2" onClick={handleClick}>
        <img src="/icons/plus.svg" alt="plus" width={12} height={12} />
        <p>Build a New Companion</p>
      </button>
    </section>
  );
};

export default Cta;
