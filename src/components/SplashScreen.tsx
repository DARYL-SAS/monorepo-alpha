// src/components/SplashScreen.tsx
const logo = "./logo_horizontale.png";

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 z-50">
      <img
        src={logo}
        alt="Logo"
        className="w-80 h-auto animate-wave-effect"
      />
    </div>
  );
};

export default SplashScreen;
