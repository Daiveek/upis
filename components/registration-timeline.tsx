type TimelineProps = { scheduled: boolean; approved?: boolean; currentStep?: number };

const steps = [
  ["Application submitted", "Your property application has been created."],
  ["Documents received", "Your sale deed details are ready for review."],
  ["Document verification", "Property records are being checked."],
  ["Property visit scheduled", "An authorised officer will visit the property."],
  ["Officer verification", "Property location and owner presence are checked."],
  ["Internal verification", "The verification record is being reviewed."],
  ["Government verification", "Approval is being prepared in this prototype."],
  ["Ownership confirmation", "Your ownership details are being confirmed."],
  ["Property Passport creation", "Your verified property is being linked."],
  ["Passport ready", "Your Property Passport is ready to use."],
];

export function RegistrationTimeline({ scheduled, approved = false, currentStep }: TimelineProps) {
  const completedThrough = approved ? steps.length - 1 : currentStep ?? (scheduled ? 3 : 1);
  return <section aria-label="Application progress" className="rounded-[1.75rem] border border-[#dce4dc] bg-white p-6 shadow-card sm:p-8">
    <p className="text-xs font-bold tracking-[.16em] text-saffron">PROPERTY VERIFICATION JOURNEY</p>
    <div className="mt-7 space-y-0">{steps.map(([step, explanation], index) => {
      const done = index < completedThrough || approved;
      const current = !approved && index === completedThrough;
      return <div key={step} className="relative flex gap-4 pb-6 last:pb-0"><div className="flex flex-col items-center"><span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${done ? "bg-moss text-white" : current ? "border-2 border-saffron bg-[#fff8f1] text-saffron" : "border border-[#c8d2c8] text-[#809083]"}`}>{done ? "✓" : current ? "→" : "○"}</span>{index < steps.length - 1 && <span className={`mt-1 h-full w-px ${done ? "bg-moss" : "bg-[#d6ded5]"}`} />}</div><div className="pt-1"><p className="text-[10px] font-bold tracking-[.14em] text-[#78867b]">{String(index + 1).padStart(2, "0")}</p><p className={`mt-1 font-semibold ${current ? "text-saffron" : "text-ink"}`}>{step}</p>{(current || done) && <p className="mt-1 text-sm leading-5 text-[#647168]">{explanation}</p>}</div></div>;
    })}</div>
  </section>;
}
