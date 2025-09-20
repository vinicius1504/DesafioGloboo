import { Outlet } from '@tanstack/react-router';
import { ThemeProvider } from '@/providers';

export default function Root() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  );
}