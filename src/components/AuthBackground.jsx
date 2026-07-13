function AuthBackground({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* Desktop */}
      <div
        className="hidden xl:block absolute inset-0 bg-cover bg-bottom bg-no-repeat -z-20"
        style={{
          backgroundImage: "url('/images/hero-desktop.jpeg')",
        }}
      />

      {/* Tablet */}
      <div
        className="hidden md:block xl:hidden absolute inset-0 bg-cover bg-center bg-no-repeat -z-20"
        style={{
          backgroundImage: "url('/images/hero-tablet.jpeg')",
        }}
      />

      {/* Mobile */}
      <div
        className="block md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat -z-20"
        style={{
          backgroundImage: "url('/images/hero-mobile.jpeg')",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-white/10 -z-10"></div>

      {/* Page Content */}
      <div className="relative min-h-screen flex items-center justify-center">
        {children}
      </div>

    </div>
  );
}

export default AuthBackground;