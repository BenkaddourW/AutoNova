const Footer = () => (
  <footer className="bg-slate-800 text-slate-400">
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase">Solutions</h3>
          <ul className="mt-4 space-y-2">
            <li><a href="#" className="footer-link">Location courte durée</a></li>
            <li><a href="#" className="footer-link">Location longue durée</a></li>
            <li><a href="#" className="footer-link">Affaires</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase">Support</h3>
          <ul className="mt-4 space-y-2">
            <li><a href="#" className="footer-link">FAQ</a></li>
            <li><a href="#" className="footer-link">Assistance</a></li>
            <li><a href="#" className="footer-link">Politiques</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase">Entreprise</h3>
          <ul className="mt-4 space-y-2">
            <li><a href="/a-propos" className="footer-link">À Propos</a></li>
            <li><a href="#" className="footer-link">Carrières</a></li>
            <li><a href="/contact" className="footer-link">Contact</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase">Légal</h3>
          <ul className="mt-4 space-y-2">
            <li><a href="#" className="footer-link">Confidentialité</a></li>
            <li><a href="#" className="footer-link">Conditions</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-8 border-t border-slate-700 pt-8 text-center">
        <p>© {new Date().getFullYear()} AutoNova. Tous droits réservés.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
