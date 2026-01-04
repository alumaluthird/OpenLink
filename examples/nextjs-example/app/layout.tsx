import { OpenLinkProvider } from '@openlink/nextjs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <OpenLinkProvider network="devnet" appName="OpenLink Next.js Demo">
          {children}
        </OpenLinkProvider>
      </body>
    </html>
  );
}

