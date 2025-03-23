
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-apple-gray/30 flex flex-col items-center justify-center px-4">
      <div className="glass-effect max-w-md w-full p-8 text-center animate-scale-in">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-apple-blue/10 flex items-center justify-center">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-apple-blue"
          >
            <path 
              d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold mb-4 text-apple-black">404</h1>
        <p className="text-xl text-apple-dark-gray mb-6">
          The page you're looking for doesn't exist.
        </p>
        
        <Link 
          to="/" 
          className="inline-flex items-center justify-center bg-apple-blue hover:bg-apple-blue/90 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
