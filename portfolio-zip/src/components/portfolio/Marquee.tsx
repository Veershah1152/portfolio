const items = [
  "OSCP_TRACK",
  "ANDROID_14",
  "KOTLIN_COROUTINES",
  "TENSORFLOW_LITE",
  "BURP_SUITE",
  "WIRESHARK",
  "NMAP",
  "DOCKER",
  "PYTORCH",
  "RUST_BEGINNER",
  "REACT_NATIVE",
  "POSTGRES",
];

export function Marquee() {
  return (
    <div className="border-y border-border/60 overflow-hidden bg-card/30">
      <div className="flex animate-marquee whitespace-nowrap py-3">
        {[...items, ...items].map((t, i) => (
          <span
            key={i}
            className="px-8 font-mono text-[11px] tracking-[0.3em] text-muted-foreground"
          >
            <span className="text-phosphor/60">{"//"}</span> {t}
          </span>
        ))}
      </div>
    </div>
  );
}
