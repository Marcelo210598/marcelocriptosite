import React from 'react'

export default function Contato(): React.JSX.Element {
  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <h2 className="text-2xl font-bold">Contato</h2>
      <p className="mt-2 text-zinc-300">Tem sugestões ou quer falar comigo?</p>
      <p className="mt-1 text-zinc-400">
        Instagram: <a href="https://www.instagram.com/marcelo_di_foggia_jr/" target="_blank" rel="noreferrer" className="text-indigo-300 hover:text-indigo-200">@marcelo_di_foggia_jr</a>
      </p>
    </section>
  )
}