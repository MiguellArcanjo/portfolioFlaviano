import './globals.css';

export const metadata = {
  title: 'Flaviano · Crédito com clareza',
  description: 'Conheça o trabalho de Flaviano em crédito consignado. Orientação para entender opções, comparar condições e decidir com clareza.',
};

export const viewport = { themeColor: '#f46b25' };

export default function RootLayout({ children }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
