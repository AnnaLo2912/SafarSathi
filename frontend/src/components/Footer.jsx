export default function Footer() {
  const exploreLinks = [
    'Destinations',
    'Travel Guides',
    'AI Trip Planner',
    'Safety Features',
    'Verified Guides',
  ]

  const companyLinks = ['About Us', 'How It Works', 'For Guides', 'Pricing', 'Blog']

  const socialLinks = ['Twitter', 'Instagram', 'LinkedIn', 'YouTube']

  return (
    <footer className="bg-deepblue text-cream px-6 pt-20 pb-10">
      {/* TOP SECTION */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* COLUMN 1 - Brand */}
          <div className="md:col-span-4">
            <h2 className="font-playfair text-3xl font-bold text-cream mb-1">
              SafarSathi
            </h2>
            <p className="font-garamond text-sm italic text-saffron mb-4">
              सुरक्षित यात्रा
            </p>
            <p className="font-garamond text-base text-cream leading-relaxed max-w-xs">
              AI-powered safety and travel planning for foreign tourists in
              India. Always within reach, always within budget.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 mt-6 flex-wrap">
              {socialLinks.map((social) => (
                <button
                  key={social}
                  className="border border-cream/30 text-cream font-garamond text-xs px-4 py-2 rounded-full hover:border-saffron hover:text-saffron transition-all duration-300 cursor-pointer"
                >
                  {social}
                </button>
              ))}
            </div>
          </div>

          {/* COLUMN 2 - Explore */}
          <div className="md:col-span-2">
            <h3 className="font-garamond text-xs uppercase tracking-widest text-cream mb-6">
              Explore
            </h3>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="font-garamond text-sm text-cream hover:text-saffron transition-colors cursor-pointer"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3 - Company */}
          <div className="md:col-span-2">
            <h3 className="font-garamond text-xs uppercase tracking-widest text-cream mb-6">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="font-garamond text-sm text-cream hover:text-saffron transition-colors cursor-pointer"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4 - Emergency Contacts */}
          <div className="md:col-span-4">
            <h3 className="font-garamond text-xs uppercase tracking-widest text-cream mb-6">
              Stay Safe Out There
            </h3>

            <div className="bg-cream/10 border border-cream/20 rounded-xl p-5\">
              {/* Header */}
              <p className="font-playfair text-lg text-cream font-semibold mb-1">
                Emergency Contacts
              </p>
              <p className="font-garamond text-xs text-cream/70 mb-4">
                Save these before you travel
              </p>

              {/* Emergency Numbers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-garamond text-sm text-cream">
                    🚨 India Emergency
                  </p>
                  <p className="font-playfair text-sm text-saffron font-bold">
                    112
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="font-garamond text-sm text-cream">
                    🏥 Ambulance
                  </p>
                  <p className="font-playfair text-sm text-saffron font-bold">
                    108
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="font-garamond text-sm text-cream">
                    👮 Police
                  </p>
                  <p className="font-playfair text-sm text-saffron font-bold">
                    100
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="my-4 w-full h-px bg-cream/20" />

              {/* SafarSathi SOS */}
              <div className="flex items-center justify-between">
                <p className="font-garamond text-sm text-cream">
                  📱 SafarSathi SOS
                </p>
                <div className="bg-terracotta text-cream font-garamond text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-cream animate-pulse" />
                  Always Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="max-w-6xl mx-auto w-full h-px bg-cream/20 mb-10" />

      {/* BOTTOM BAR */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-garamond text-xs text-cream/80">
          © 2026 SafarSathi. Made with ❤️ for safe travel across India.
        </p>

        <p className="font-playfair text-sm text-cream/50 italic">
          SafarSathi
        </p>

        <div className="flex gap-6">
          <a
            href="#"
            className="font-garamond text-xs text-cream/80 hover:text-cream transition-colors cursor-pointer"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="font-garamond text-xs text-cream/80 hover:text-cream transition-colors cursor-pointer"
          >
            Terms of Use
          </a>
          <a
            href="#"
            className="font-garamond text-xs text-cream/80 hover:text-cream transition-colors cursor-pointer"
          >
            Cookie Policy
          </a>
        </div>
      </div>
    </footer>
  )
}
