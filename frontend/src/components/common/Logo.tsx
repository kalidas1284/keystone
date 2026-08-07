function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white shadow-lg">
        K
      </div>

      <div>
        <h1 className="text-xl font-bold text-slate-800">
          Keystone
        </h1>

        <p className="text-xs text-slate-500">
          Field Service Management
        </p>
      </div>
    </div>
  );
}

export default Logo;