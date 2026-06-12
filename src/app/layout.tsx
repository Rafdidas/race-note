import type { Metadata } from "next";
import { PublicFooter } from "@/components/PublicFooter/PublicFooter";
import { PublicHeader } from "@/components/PublicHeader/PublicHeader";
import { ThemeScript } from "@/components/ThemeScript/ThemeScript";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-700.css";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: {
    default: "RaceNote",
    template: "%s · RaceNote",
  },
  description: "이번 주 볼만한 모터스포츠를 한국 시간으로 알려주는 브리핑",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-theme="light" lang="ko" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <div className="public-layout">
          <PublicHeader />
          <div className="public-layout__content">{children}</div>
          <PublicFooter />
        </div>
      </body>
    </html>
  );
}
