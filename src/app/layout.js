import { Roboto, Roboto_Serif } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import Footer from "@/components/Footer";
import ClientLayout from "@/components/ClientLayout";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

config.autoAddCss = false;

const roboto = Roboto({ variable: "--font-roboto", subsets: ["latin"] });
const robotoSerif = Roboto_Serif({ variable: "--font-roboto-serif", subsets: ["latin"] });

export const metadata = {
  title: "Madison Jay",
  description: "Dashboard for Madison Jay",
};

export default async function RootLayout({ children }) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isLoggedIn = !!session;

  return (
    <html lang="en">
      <body className={`${roboto.variable} ${robotoSerif.variable} antialiased`}>
        <Toaster position="top-right" />

        <ClientLayout isLoggedIn={isLoggedIn}>
          {children}
          <Footer />
        </ClientLayout>
      </body>
    </html>
  );
}