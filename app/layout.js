import { Fraunces, Manrope } from 'next/font/google';
import './globals.css';

// Fraunces gives the headings a warm, editorial voice; Manrope keeps long reading comfortable.
const display = Fraunces({ subsets: ['latin'], style: ['normal', 'italic'], axes: ['opsz', 'SOFT'], variable: '--font-display', display: 'swap' });
const body = Manrope({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

export const metadata = {
  title: 'Flaviano · Crédito com clareza',
  description: 'Conheça o trabalho de Flaviano em crédito consignado. Orientação para entender opções, comparar condições e decidir com clareza.',
};

export const viewport = { themeColor: '#103b35' };

export default function RootLayout({ children }) {
  return <html lang="pt-BR" className={`${display.variable} ${body.variable}`}><body>{children}</body></html>;
}
