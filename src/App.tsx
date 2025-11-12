import React from 'react'
import { Link, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Noticias from './pages/Noticias'
import Analises from './pages/Analises'
import Contato from './pages/Contato'
import Market from './pages/Market'
import MoedaDetalhe from './pages/MoedaDetalhe'
import NoticiaDetalhe from './pages/NoticiaDetalhe'

export default function App(): React.JSX.Element {
  return (
    <main id="inicio" className="min-h-screen text-white">
      {/* Cabeçalho com navegação */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link to="/" className="text-base font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">Marcelo Cripto Labs</Link>
          <nav className="flex gap-5 text-sm text-zinc-300">
            <Link to="/noticias" className="hover:text-white">Notícias</Link>
            <Link to="/analises" className="hover:text-white">Análises</Link>
        <Link to="/market" className="hover:text-white">Moedas</Link>
            <Link to="/contato" className="hover:text-white">Contato</Link>
          </nav>
        </div>
      </header>

      {/* Conteúdo por rotas */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/noticias" element={<Noticias />} />
        <Route path="/noticia/:id" element={<NoticiaDetalhe />} />
        <Route path="/analises" element={<Analises />} />
        <Route path="/market" element={<Market />} />
        <Route path="/moeda/:id" element={<MoedaDetalhe />} />
        <Route path="/contato" element={<Contato />} />
      </Routes>

      {/* Rodapé */}
      <footer className="border-t border-zinc-800 mt-10">
        <div className="mx-auto max-w-5xl px-6 py-6 text-sm text-zinc-400">
          <p>© {new Date().getFullYear()} Marcelo Cripto Labs. Todos os direitos reservados.</p>
          <p className="mt-1">Este site é informativo e não constitui recomendação de investimento.</p>
        </div>
      </footer>

      {/* Botão flutuante para voltar ao início */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          to="/"
          className="rounded-full border border-indigo-500/50 bg-zinc-900/70 px-3 py-2 text-xs sm:text-sm font-medium text-indigo-200 shadow-lg backdrop-blur-sm hover:border-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          aria-label="Voltar para o início do site"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  )
}