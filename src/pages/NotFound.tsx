import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="mb-4 text-6xl md:text-8xl font-display font-bold text-accent">404</h1>
        <p className="mb-6 text-lg md:text-xl text-muted-foreground font-body">
          Ой! Сторінку не знайдено
        </p>
        <Link to="/">
          <Button size="lg" className="font-body font-medium gap-2">
            <Home className="h-5 w-5" />
            Повернутися на головну
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
