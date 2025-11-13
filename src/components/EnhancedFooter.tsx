import React from 'react'
import { Github, Twitter, Linkedin, Mail, ExternalLink } from 'lucide-react'

export const EnhancedFooter: React.FC = () => {
  const currentYear = new Date().getFullYear()
  
  const socialLinks = [
    { icon: <Github className="w-5 h-5" />, href: '#', label: 'GitHub' },
    { icon: <Twitter className="w-5 h-5" />, href: '#', label: 'Twitter' },
    { icon: <Linkedin className="w-5 h-5" />, href: '#', label: 'LinkedIn' },
    { icon: <Mail className="w-5 h-5" />, href: '#', label: 'Email' },
  ]

  const quickLinks = [
    { name: 'Início', href: '/' },
    { name: 'Notícias', href: '/noticias' },
    { name: 'Análises', href: '/analises' },
    { name: 'Mercado', href: '/market' },
    { name: 'Contato', href: '/contato' },
  ]

  const resources = [
    { name: 'Aprenda Cripto', href: '#' },
    { name: 'Guia para Iniciantes', href: '#' },
    { name: 'Análise Técnica', href: '#' },
    { name: 'Blockchain 101', href: '#' },
  ]

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 mt-16">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-cyan-400 to-fuchsia-400 bg-clip-text text-transparent mb-4">
              Marcelo Cripto
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              Seu portal confiável para notícias, análises e informações sobre o mercado de criptomoedas. 
              Acompanhe as últimas tendências e tome decisões informadas.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-zinc-400 hover:text-indigo-400 transition-colors duration-200"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="text-white font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-zinc-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="text-white font-semibold mb-4">Recursos</h4>
            <ul className="space-y-2">
              {resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-zinc-400 hover:text-white transition-colors duration-200 text-sm flex items-center gap-1"
                  >
                    {link.name}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divisor */}
        <div className="border-t border-zinc-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-zinc-400 text-sm">
              <p>© {currentYear} Marcelo Cripto. Todos os direitos reservados.</p>
              <p className="mt-1">
                Este site é informativo e não constitui recomendação de investimento.
              </p>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-zinc-400 hover:text-white transition-colors duration-200">
                Termos de Uso
              </a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors duration-200">
                Política de Privacidade
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}