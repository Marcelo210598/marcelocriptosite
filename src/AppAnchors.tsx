import React from 'react'

export default function App(): React.JSX.Element {
  return (
    <main id="inicio" className="min-h-screen text-white">
      {/* Cabeçalho com navegação */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <a href="#inicio" className="text-base font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">Marcelo Cripto Labs</a>
          <nav className="flex gap-5 text-sm text-zinc-300">
            <a href="#noticias" className="hover:text-white">Notícias</a>
            <a href="#analises" className="hover:text-white">Análises</a>
            <a href="#contato" className="hover:text-white">Contato</a>
          </nav>
        </div>
      </header>

      {/* Hero / Introdução */}
      <section id="inicio-hero" className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-bold">Notícias e análises do mercado cripto</h1>
        <p className="mt-3 max-w-2xl text-zinc-300">
          Acompanhe novidades, entenda conceitos e aprofunde-se em análises fundamentais do mercado
          de criptomoedas.
        </p>
        <div className="mt-5 flex gap-3">
          <a href="#analises" className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500">Ir para Análises</a>
          <a href="#noticias" className="rounded border border-indigo-500/50 px-4 py-2 text-sm font-medium text-indigo-200 hover:border-indigo-400 hover:bg-indigo-500/10">Ver Notícias</a>
        </div>
      </section>

      {/* Notícias (cards de exemplo) */}
      <section id="noticias" className="mx-auto max-w-5xl px-6 py-10">
        <h2 className="text-2xl font-bold">Notícias</h2>
        <p className="mt-2 text-zinc-400">Destaques recentes do ecossistema cripto (exemplos).</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { titulo: 'ETF de Bitcoin atrai novos fluxos', resumo: 'Produtos regulados impulsionam adesão institucional.' },
            { titulo: 'Atualizações em camadas L2', resumo: 'Escalabilidade e redução de custos de transação.' },
            { titulo: 'Regulação em debate', resumo: 'Países avançam em frameworks para ativos digitais.' },
          ].map((n, i) => (
            <article key={i} className="rounded-lg border border-zinc-700 bg-zinc-900/40 p-4">
              <h3 className="text-base font-semibold text-white">{n.titulo}</h3>
              <p className="mt-2 text-sm text-zinc-300">{n.resumo}</p>
              <div className="mt-3">
                <a href="#" className="text-xs text-indigo-300 hover:text-indigo-200">Ler mais</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Página contínua de análise do Bitcoin */}
      <section id="analises" className="analysis-flow mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold">Análise fundamentalista: Bitcoin (BTC)</h1>
        <div className="mt-4">
          <a
            href="#inicio"
            className="inline-block rounded border border-indigo-500/50 bg-transparent px-4 py-2 text-sm font-medium text-indigo-300 hover:border-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-200"
            aria-label="Voltar para o início do site"
          >
            Voltar ao início
          </a>
        </div>
        <p className="mt-2 text-sm text-zinc-400">Criado em 2008 (whitepaper) e lançado em 2009 (rede)</p>
        <p className="mt-4 text-zinc-300">
          O Bitcoin é um protocolo monetário aberto e descentralizado, projetado para ser resistente
          à censura e previsível em sua política de emissão. Avaliar seus fundamentos envolve entender
          como a oferta é programada, como a rede se protege, quem está adotando a tecnologia e quais
          forças externas podem acelerar ou frear o ciclo.
        </p>

        <h3 className="mt-10 text-xl font-semibold">Oferta e escassez programada</h3>
        <p className="mt-3 text-zinc-300">
          A oferta máxima é limitada a 21 milhões de unidades, e eventos de <em>halving</em> a cada
          ~4 anos reduzem pela metade a emissão de novos BTC. Essa dinâmica eleva o <em>stock-to-flow</em>
          ao longo do tempo e reforça a narrativa de escassez digital. Embora métricas de modelos
          simplificados devam ser usadas com cautela, o efeito estrutural é claro: a inflação anual
          do Bitcoin tende a zero, transferindo a pressão de venda dos mineradores para participantes
          de mercado com horizontes mais longos. Em ciclos pós-halving, a oferta nova que chega ao
          mercado diminui, tornando fluxos de demanda relativamente mais relevantes para preço.
        </p>

        <h3 className="mt-8 text-xl font-semibold">Segurança e descentralização</h3>
        <p className="mt-3 text-zinc-300">
          A segurança é ancorada pela Prova de Trabalho (PoW) e por um hashrate historicamente
          crescente, que torna economicamente inviáveis ataques de 51% em larga escala. A validação
          por nós independentes (full nodes) mantém regras imutáveis e minimiza pontos de falha
          centralizados. A descentralização geográfica e de participação contribui para a resiliência
          da rede diante de eventos regulatórios ou geopolíticos. Em termos de governança, mudanças
          no protocolo são conservadoras e amplamente debatidas, o que preserva a credibilidade das
          garantias monetárias do Bitcoin.
        </p>

        <h3 className="mt-8 text-xl font-semibold">Adoção e liquidez</h3>
        <p className="mt-3 text-zinc-300">
          A infraestrutura evoluiu com a presença de custodiantes institucionais, ETFs <em>spot</em>
          em alguns mercados, corretoras mais maduras e melhorias de autocustódia para usuários finais.
          Tudo isso sustenta liquidez 24/7 e reduz fricções de acesso. No varejo, carteiras mais simples
          e soluções de segunda camada (L2) ampliam casos de uso, enquanto investidores institucionais
          trazem fluxos relevantes em momentos de apetite por risco. A convergência de infraestrutura
          e educação tende a tornar os ciclos menos extremos, ainda que a volatilidade permaneça como
          característica intrínseca do ativo.
        </p>

        <h3 className="mt-8 text-xl font-semibold">Riscos e catalisadores</h3>
        <p className="mt-3 text-zinc-300">
          Entre os principais riscos, destacam-se mudanças regulatórias, choques macro (liquidez global,
          taxas de juros, dólar forte), e eventos idiossincráticos (falências de participantes relevantes).
          Por outro lado, catalisadores incluem halvings, entrada de novos mercados com produtos regulados
          (como ETFs), avanços em escalabilidade e casos de uso em pagamentos. Em horizontes mais curtos,
          preço é sensível a fluxo e narrativa; em horizontes longos, o <em>play</em> de escassez
          e segurança tende a prevalecer.
        </p>

        <h3 className="mt-8 text-xl font-semibold">Conclusão</h3>
        <p className="mt-3 text-zinc-300">
          A tese fundamental do Bitcoin permanece robusta: política monetária previsível, segurança
          comprovada e adoção crescente. Para quem acompanha o ativo, é útil separar ruído de curto
          prazo (fluxo, narrativa, macro) de fundamentos de longo prazo (oferta, segurança, adesão).
          Ajustar exposição ao ciclo e manter disciplina de risco continua sendo determinante para
          bons resultados.
        </p>

        {/* Resumo histórico */}
        <div className="mt-8 rounded-lg border border-zinc-700 bg-zinc-900/30 p-4">
          <h4 className="text-sm font-semibold">Resumo do Bitcoin (2008 → hoje)</h4>
          <p className="mt-2 text-sm text-zinc-300">
            2008: publicação do whitepaper por Satoshi Nakamoto. 2009: bloco gênesis e início da rede.
            2010–2013: primeiras exchanges, casos de uso e maior consciência pública. 2016–2020:
            ciclos de halving, maturação da infraestrutura e chegada de capital institucional. 2021–2024:
            nova onda de adoção, discussão regulatória e produtos como ETFs <em>spot</em> em alguns
            países. Hoje: consolidação da tese de escassez e segurança, com expansão de autocustódia,
            camadas de escalabilidade e bases mais amplas de usuários.
          </p>
        </div>

        <div className="mt-10">
          <a
            href="#inicio"
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500"
            aria-label="Voltar para o início do site"
          >
            Voltar ao início
          </a>
        </div>
      </section>


      {/* Contato */}
      <section id="contato" className="mx-auto max-w-5xl px-6 py-10">
        <h2 className="text-2xl font-bold">Contato</h2>
        <p className="mt-2 text-zinc-300">Tem sugestões ou quer falar comigo?</p>
        <p className="mt-1 text-zinc-400">
          Instagram: <a href="https://www.instagram.com/marcelo_di_foggia_jr/" target="_blank" rel="noreferrer" className="text-indigo-300 hover:text-indigo-200">@marcelo_di_foggia_jr</a>
        </p>
      </section>

      {/* Rodapé */}
      <footer className="border-t border-zinc-800">
        <div className="mx-auto max-w-5xl px-6 py-6 text-sm text-zinc-400">
          <p>© {new Date().getFullYear()} Marcelo Cripto Labs. Todos os direitos reservados.</p>
          <p className="mt-1">Este site é informativo e não constitui recomendação de investimento.</p>
        </div>
      </footer>
      {/* Botão flutuante para voltar ao início */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="#inicio"
          className="rounded-full border border-indigo-500/50 bg-zinc-900/70 px-3 py-2 text-xs sm:text-sm font-medium text-indigo-200 shadow-lg backdrop-blur-sm hover:border-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          aria-label="Voltar para o início do site"
        >
          Voltar ao início
        </a>
      </div>
    </main>
  )
}