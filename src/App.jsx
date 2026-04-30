import { BrowserRouter } from "react-router-dom";
import Header    from "./components/Header";
import Footer    from "./components/Footer";
import AppRoutes from "./routes";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <AppRoutes />
      <Footer />
    </BrowserRouter>
  );
}
