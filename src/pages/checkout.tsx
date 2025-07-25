import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Checkout() {
  const router = useRouter();
  const sessionId = router.query.session_id;

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/processarCheckout?session_id=${sessionId}`)
        .then((res) => res.json())
        .then(() => router.push("/rh"))
        .catch((err) => console.error("Erro ao finalizar cadastro:", err));
    }
  }, [sessionId]);

  return <p>Finalizando cadastro da empresa...</p>;
}