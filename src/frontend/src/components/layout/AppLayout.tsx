import { Outlet } from '@tanstack/react-router';
import TopNav from './TopNav';
import Footer from './Footer';

export default function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
