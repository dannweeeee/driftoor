import Dashboard from "@/components/dashboard";
import Navbar from "@/components/layout/navbar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Dashboard />
      </div>
    </div>
  );
}
