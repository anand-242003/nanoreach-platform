export default function MacbookFrame({ children }) {
  return (
    <div className="relative mx-auto w-full max-w-[90rem]">
      <div className="relative rounded-2xl border border-neutral-700 bg-neutral-900 p-2 shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
        <div className="mx-auto mb-2 h-1.5 w-1.5 rounded-full bg-neutral-600" />
        <div className="relative overflow-hidden rounded-lg bg-white" style={{ height: '62vh', minHeight: 480 }}>
          {children}
        </div>
      </div>
      <div className="relative mx-auto h-5 w-[45%] rounded-b-2xl bg-neutral-800 shadow-xl">
        <div className="absolute inset-x-0 top-0 mx-auto h-1.5 w-20 rounded-b bg-neutral-700" />
      </div>
    </div>
  );
}
