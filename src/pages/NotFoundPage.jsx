import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="page-placeholder page-placeholder--404">
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/" className="page-placeholder__back">← Back to Home</Link>
    </main>
  );
}
