"use client";

import { Flag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Field, inputCls, Modal } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useDemo } from "@/store/demo-store";

const USER_REASONS = ["Made me uncomfortable", "Unwanted contact after the event", "Harassment or abuse", "Fake profile", "Something else"];
const EXP_REASONS = ["Not as described", "Venue closed or unsafe", "Host didn't show up", "Pricing or payment issue", "Something else"];

/** Report a member or an experience. Goes to the hub's trust queue (Admin → Reports). */
export function ReportModal({
  open,
  onClose,
  kind,
  targetId,
  targetLabel,
  offerBlock,
}: {
  open: boolean;
  onClose: () => void;
  kind: "user" | "experience";
  targetId: string;
  targetLabel: string;
  offerBlock?: boolean;
}) {
  const report = useDemo((s) => s.report);
  const block = useDemo((s) => s.block);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [alsoBlock, setAlsoBlock] = useState(kind === "user");
  const [error, setError] = useState("");
  const reasons = kind === "user" ? USER_REASONS : EXP_REASONS;

  return (
    <Modal open={open} onClose={onClose}>
      <form
        className="p-6 sm:p-7"
        onSubmit={(e) => {
          e.preventDefault();
          if (!reason) return setError("Choose the reason that fits best.");
          const severity = reason.includes("Harassment") || reason.includes("unsafe") ? "high" : reason.includes("Unwanted") || reason.includes("uncomfortable") ? "medium" : "low";
          report({ kind, targetId, targetLabel, reason: details ? `${reason}: ${details}` : reason, severity });
          if (kind === "user" && offerBlock && alsoBlock) block(targetId);
          toast.success(kind === "user" && alsoBlock ? `Report sent and ${targetLabel} blocked` : "Report sent to the After Hours team");
          setReason("");
          setDetails("");
          setError("");
          onClose();
        }}
      >
        <div className="flex items-center gap-2 text-danger">
          <Flag className="size-4" />
          <span className="font-mono text-[11px] uppercase tracking-wider">Report</span>
        </div>
        <h3 className="mt-1 pr-10 font-display text-xl font-semibold">Report {targetLabel}</h3>
        <p className="mt-1 text-sm text-muted">Reports are confidential. The hub team reviews them; urgent ones during an event go to the event lead straight away.</p>
        <div className="mt-5 space-y-2">
          {reasons.map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setReason(r)}
              className={cn("block w-full rounded-xl border px-3.5 py-2.5 text-left text-sm font-semibold transition", reason === r ? "border-ink bg-ink text-white" : "border-line hover:border-ink/30")}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <Field label="Anything else we should know? (optional)">
            <textarea id="report-details" rows={3} className={inputCls} value={details} onChange={(e) => setDetails(e.target.value)} />
          </Field>
        </div>
        {kind === "user" && offerBlock && (
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-[13px] font-semibold">
            <input id="report-block" type="checkbox" checked={alsoBlock} onChange={(e) => setAlsoBlock(e.target.checked)} className="size-4 accent-[#141a33]" /> Also block {targetLabel}. You won&apos;t be grouped together again.
          </label>
        )}
        {error && <p className="mt-3 text-[13px] font-semibold text-danger">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger">
            Send report
          </Button>
        </div>
      </form>
    </Modal>
  );
}
