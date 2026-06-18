"use client";

import { REPORT_STATUSES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

export function TrackingTimeline({ currentStatus }: { currentStatus: string }) {
  const currentStep = REPORT_STATUSES.find((s) => s.value === currentStatus)?.step || 1;

  return (
    <div className="space-y-0">
      {REPORT_STATUSES.map((status, index) => {
        const isComplete = status.step <= currentStep;
        const isCurrent = status.value === currentStatus;
        return (
          <div key={status.value} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                  isComplete ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400",
                  isCurrent && "ring-4 ring-emerald-100"
                )}
              >
                {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </div>
              {index < REPORT_STATUSES.length - 1 && (
                <div className={cn("w-0.5 h-12", isComplete && status.step < currentStep ? "bg-emerald-600" : "bg-gray-200")} />
              )}
            </div>
            <div className="pb-8 pt-1">
              <p className={cn("font-medium", isComplete ? "text-gray-900" : "text-gray-400")}>{status.label}</p>
              {isCurrent && <p className="text-sm text-emerald-600 mt-0.5">Current status</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
