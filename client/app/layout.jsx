import localFont from "next/font/local";
import "./globals.css";

export const metadata = {
  title: "Minesweeper",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
