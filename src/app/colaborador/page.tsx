import { ProtectedRoute } from "../components/ProtectedRoute";
import  ColaboradorDashboard  from "./ColaboradorDashboard"; // já migrado

export default function ColaboradorPage() {
    return (
      <ProtectedRoute allowedRoles={["colaborador"]}>
        <ColaboradorDashboard />
      </ProtectedRoute>
    );
  }
