const AboutPage = () => {
  return (
    <div className="bg-white dark:bg-slate-800 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold text-sky-600 dark:text-sky-400 tracking-wide uppercase">Notre histoire</p>
          <h1 className="mt-2 text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl">Au service de votre mobilité</h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-500 dark:text-slate-400">
            Chez AutoNova, nous croyons que la location de voiture doit être une expérience simple, transparente et agréable.
          </p>
        </div>
        <div className="mt-20 prose prose-lg dark:prose-invert mx-auto text-slate-600 dark:text-slate-300">
          <p>
            Fondée en 2020 avec une vision claire, AutoNova s'est rapidement imposée comme un leader de la location de véhicules modernes. Notre mission est de vous offrir la liberté de vous déplacer, que ce soit pour un voyage d'affaires, une escapade de week-end ou vos besoins quotidiens.
          </p>
          <p>
            Notre flotte est soigneusement sélectionnée pour vous garantir sécurité, confort et performance. Chaque véhicule est méticuleusement entretenu par nos équipes d'experts pour que vous puissiez prendre la route en toute confiance.
          </p>
          <blockquote>
            <p>"L'innovation, le service client et la confiance sont les trois piliers sur lesquels nous avons bâti AutoNova."</p>
          </blockquote>
          <p>
            Nous sommes plus qu'une simple entreprise de location. Nous sommes votre partenaire de voyage, engagé à rendre chaque trajet inoubliable.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
