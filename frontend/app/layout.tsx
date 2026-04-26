import Header from "./components/Header";
import MainContent from "./components/MainContent";
import Footer from "./components/Footer";
import "./globals.scss";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>AI レシピメーカー</title>
      </head>
      <body>
        <Header></Header>
        <MainContent>{children}</MainContent>
        <Footer></Footer>
      </body>
    </html>
  )
}
