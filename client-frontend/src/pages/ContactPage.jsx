const ContactPage = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Contactez-nous</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Nous sommes là pour vous aider. N'hésitez pas à nous joindre.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Formulaire de contact */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="label-style">Nom complet</label>
                <input type="text" id="name" className="input-style" />
              </div>
              <div>
                <label htmlFor="email" className="label-style">E-mail</label>
                <input type="email" id="email" className="input-style" />
              </div>
              <div>
                <label htmlFor="message" className="label-style">Votre message</label>
                <textarea id="message" rows="4" className="input-style"></textarea>
              </div>
              <button type="submit" className="btn-primary w-full">Envoyer</button>
            </form>
          </div>
          {/* Informations de contact */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold">Support Client</h3>
              <p className="text-slate-600 dark:text-slate-400 mt-2">Disponible 24/7</p>
              <p className="text-sky-600 dark:text-sky-400 text-lg font-medium">+1 (800) 555-NOVA</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Siège social</h3>
              <p className="text-slate-600 dark:text-slate-400 mt-2">123 Rue de l'Avenir, Montréal, QC, Canada</p>
            </div>
            {/* Vous pourriez ajouter une carte Google Maps ici */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
