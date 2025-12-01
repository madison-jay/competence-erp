// app/fonts.js
import { Roboto, Roboto_Serif } from "next/font/google";

// Define fonts in a separate file → breaks the recursion bug
export const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["100", "300", "400", "500", "700", "900"],
  display: "swap",
});

export const robotoSerif = Roboto_Serif({
  subsets: ["latin"],
  variable: "--font-roboto-serif",
  weight: ["100", "300", "400", "500", "700", "900"],
  display: "swap",
});