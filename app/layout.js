import './globals.css';

export const metadata = {
  title: 'BABEH DIGITAL STORE - Auto Order Digital',
  description: 'Toko digital terpercaya. Pterodactyl Panel, Script Digital, VPS DigitalOcean. Auto-order instan!',
  keywords: 'pterodactyl panel, vps digitalocean, script digital, hosting murah, babeh store',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" />
      </head>
      <body className="bg-dark-900 text-gray-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
