"use client";

export default function EmailCaptureForm() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col sm:flex-row gap-3 items-center justify-center"
    >
      <label htmlFor="email-capture" className="sr-only">Email address</label>
      <input
        id="email-capture"
        type="email"
        required
        placeholder="your@email.com"
        className="w-full sm:w-72 px-4 py-3 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 transition-all"
      />
      <button
        type="submit"
        className="w-full sm:w-auto px-7 py-3 rounded-full bg-rose-600 hover:bg-rose-500 font-semibold text-white text-sm transition-colors shadow-lg shadow-rose-900/30"
      >
        Notify Me
      </button>
    </form>
  );
}
