export default function Footer() {
  return (
    <footer className="w-full py-1">
      <div className="container-max px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="container mx-auto px-4 text-center text-sm text-matrix-green-primary/70">
            &copy; {new Date().getFullYear()} Privora. Private philanthropy for
            the modern age.
          </div>
        </div>
      </div>
    </footer>
  );
}
