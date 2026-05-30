import { Link } from "react-router-dom";
import SEO from "../components/SEO";

export default function NotFoundPage() {
  return (
    <main className="page-placeholder page-placeholder--404">
      <SEO 
        title="404 - Page Not Found"
        description="The page you're looking for doesn't exist. Return to Datanitial's homepage to explore our data solutions."
      />
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/" className="page-placeholder__back">← Back to Home</Link>
    </main>
  );
}
