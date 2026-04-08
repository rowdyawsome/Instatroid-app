export default function Privacy() {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const sections = [
    {
      title: 'Information We Collect',
      content:
        'Instatroid is designed for entertainment purposes only and does not collect or store any personal information. Any usernames or information input into the platform are not stored, tracked, or transmitted to external servers.',
    },
    {
      title: 'How We Use Your Information',
      content:
        'Instatroid does not collect or store any personal information, therefore we do not use it for any purpose. The platform simulates processing but does not perform any actual data retrieval or analysis.',
    },
    {
      title: 'Data Security',
      content:
        'Instatroid prioritizes user privacy and security. We implement industry-standard security measures to protect any interaction with our platform.',
    },
    {
      title: 'Cookies and Tracking',
      content:
        'Instatroid does not use cookies or any tracking technologies to collect information about visitors.',
    },
    {
      title: 'Updates to Privacy Policy',
      content:
        'We may update this privacy policy periodically to reflect changes in our practices or for operational, legal, or regulatory reasons.',
    },
    {
      title: 'Contact Information',
      content:
        'For questions about our privacy practices or to submit a privacy-related request, please contact the Instatroid support team.',
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg text-neutral-400">Last updated: {currentDate}</p>
        </div>

        <div className="bg-neutral-800 rounded-2xl border border-neutral-700 p-8">
          <p className="text-neutral-300 leading-relaxed mb-8">
            This Privacy Policy describes how your personal information is collected, used, and shared when you visit Instatroid (the &quot;Platform&quot;).
          </p>

          {sections.map((s) => (
            <section key={s.title} className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{s.title}</h2>
              <p className="text-neutral-300 leading-relaxed">{s.content}</p>
            </section>
          ))}

          <section className="mt-12 pt-8 border-t border-neutral-600">
            <div className="border border-yellow-600/40 bg-yellow-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Disclaimer</h3>
              <p className="text-neutral-400 leading-relaxed">
                Instatroid is an entertainment platform. This is a simulation for entertainment purposes only. All trademarks, service marks, trade names, trade dress, product names and logos appearing on the site are the property of their respective owners.
              </p>
            </div>
          </section>
        </div>

        <div className="text-center mt-8">
          <p className="text-neutral-500 text-sm">© {new Date().getFullYear()} Instatroid. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
