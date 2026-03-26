import "../faust.config";
import React from "react";
import { useRouter } from "next/router";
import { FaustProvider } from "@faustwp/core";
import "../css/globals.css";
import '@/css/cards.css';
import '@/css/mana.css';
import { TooltipProvider } from "@/components/ui/tooltip"
import { SessionProvider } from "../lib/UserSessionProvider";

import { Roboto, Roboto_Slab } from "next/font/google";

const roboto = Roboto({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-roboto' });
const robotoSlab = Roboto_Slab({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-roboto-slab' });

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  return (
    <FaustProvider pageProps={pageProps}>
      <TooltipProvider>
        <div className={`${roboto.variable} ${robotoSlab.variable}`}>
          <Component {...pageProps} key={router.asPath} />
        </div>
      </TooltipProvider>
    </FaustProvider>
  );
}
