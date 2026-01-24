import { useNavigate } from "react-router-dom";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <AdminDashboard onBack={() => navigate("/")} />
  );
};

export default Admin;
