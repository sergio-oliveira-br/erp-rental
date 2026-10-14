// frontend/src/components/layout/NavbarBrand.tsx

export function NavbarBrand() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold text-sm">
        R
      </div>
      <span className="font-semibold text-gray-900 tracking-tight text-base">
        ERP Rental
      </span>
    </div>
  );
}