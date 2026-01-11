export default function MacbookFrame({ children }) {
  return (
    <div className="relative mx-auto w-full max-w-[80rem]">
      <div className="relative rounded-2xl border border-neutral-200 bg-neutral-100 p-1 shadow-2xl">
        <div className="rounded-xl bg-neutral-900 p-2">
          <div className="mx-auto mb-2 h-1.5 w-1.5 rounded-full bg-neutral-700" />
          <div className="relative overflow-hidden rounded-lg bg-white">
            {children}
          </div>
        </div>
      </div>
      <div className="relative mx-auto h-4 w-[40%] rounded-b-xl bg-neutral-200 shadow-lg">
        <div className="absolute inset-x-0 top-0 mx-auto h-1 w-16 rounded-b bg-neutral-300" />
      </div>
    </div>
  );
}
