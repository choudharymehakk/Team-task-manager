import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function Modal({ title, children, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"
        role="presentation"
        onMouseDown={onClose}
      >
        <motion.section
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="w-full max-w-xl rounded-[1.75rem] border border-white/60 bg-white p-5 shadow-2xl"
          role="dialog"
          aria-modal="true"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <header className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-slate-950">{title}</h2>
            <button className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-950" aria-label="Close" title="Close" onClick={onClose}>
              <X size={18} />
            </button>
          </header>
          {children}
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}
