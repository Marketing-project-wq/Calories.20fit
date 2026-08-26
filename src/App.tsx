import { Header } from "./components/Header";
import { ScanPage } from "./pages/ScanPage";
import { useAuth } from "./hooks/useAuth";

export function App() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 rounded-full animate-spin border-t-transparent inline-block"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header subdomainKey="calories" isAuthenticated={isAuthenticated} user={user} />

      <main>
        <ScanPage />
      </main>

      <footer className="border-t py-6 px-4 text-center text-xs text-gray-600" style={{ borderColor: "#E8E8E8" }}>
        <p>© 2024 20FIT. Semua hak dilindungi.</p>
      </footer>
    </div>
  );
}
