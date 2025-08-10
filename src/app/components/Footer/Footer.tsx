export function Footer() {
  return (
    <footer id="footer" className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-10 text-center">
        <div className="font-extrabold tracking-tight text-white">SERENZO</div>
        <p className="mt-2 text-sm">Cuidado emocional com tecnologia e humanidade.</p>
        <p className="mt-6 text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Serenzo. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
