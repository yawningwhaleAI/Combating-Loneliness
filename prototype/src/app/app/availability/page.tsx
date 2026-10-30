"use client";

import { motion } from "framer-motion";
import { BellRing, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AvailabilityEditor } from "@/components/member/availability-editor";
import { Annotation, Badge, Button, Card } from "@/components/ui";
import { fmtDate } from "@/lib/utils";
import { useDemo } from "@/store/demo-store";

export default function AvailabilityPage() {
  const availability = useDemo((s) => s.availability);
  const rosterUpdated = useDemo((s) => s.rosterUpdated);
  const apply = useDemo((s) => s.applyRosterUpdate);
  const setWindows = useDemo((s) => s.setWindows);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-[30px] font-semibold">My availability</h1>
        <Annotation label="Private by design" />
      </div>
      <p className="mt-1 max-w-2xl text-[15px] text-muted">Free With Me only recommends plans that fit inside these windows. Change them whenever your roster changes; recommendations update instantly.</p>

      <Card className={rosterUpdated ? "mt-6 border-ok/30 p-5" : "mt-6 border-sunrise/30 bg-sunrise-soft/40 p-5"}>
        {!rosterUpdated ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-sunrise text-white">
                <BellRing className="size-5" />
              </span>
              <div>
                <div className="font-semibold">New roster released for next week</div>
                <p className="text-[13px] text-muted">Demo: Riya is now on shift Thursday, and gets Friday 4–9 PM off instead.</p>
              </div>
            </div>
            <Button
              variant="accent"
              onClick={() => {
                apply();
                toast.success("Availability updated. Recommendations refreshed.");
              }}
            >
              <RefreshCw className="size-4" /> Apply roster change
            </Button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-start gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-ok text-white">
              <Check className="size-5" strokeWidth={3} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">Roster change applied</div>
              <div className="mt-1 flex flex-wrap gap-2 text-[12.5px]">
                {availability.blocked.map((b) => (
                  <Badge key={b.date}>{fmtDate(b.date)}: on shift (private)</Badge>
                ))}
                <Badge tone="iris">Fri 6 Nov 4–9 PM added · expires Fri</Badge>
              </div>
              <p className="mt-2 text-[12.5px] text-muted">Only the free windows changed. Nobody sees that Thursday became a work day.</p>
            </div>
          </motion.div>
        )}
      </Card>

      <div className="mt-6">
        <AvailabilityEditor
          value={availability}
          onChange={(a) => {
            setWindows(a.windows);
          }}
        />
      </div>
    </div>
  );
}
