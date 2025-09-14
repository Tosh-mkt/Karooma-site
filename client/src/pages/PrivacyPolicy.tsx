import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 font-fredoka">
              Política de Privacidade
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Aqui você encontrará informações claras sobre como cuidamos dos seus dados. 
              Nossa prioridade é sua tranquilidade e confiança.
            </p>
          </div>

          <div className="space-y-8">
            {/* Compromisso com a privacidade */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                💜 Nosso Compromisso com Você
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Sua privacidade é muito importante para nós, mãe! Sabemos como é valioso ter um espaço seguro 
                onde você pode buscar dicas e soluções sem preocupações. Esta política explica, de forma simples, 
                como cuidamos das suas informações aqui no Karooma.
              </p>
            </section>

            {/* Programa Amazon */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                🛒 Como Funcionam Nossas Recomendações de Produtos
              </h2>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Participamos do Programa de Associados da Amazon para poder continuar oferecendo conteúdo 
                  gratuito e de qualidade para vocês. Funciona assim:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                  <li>Quando você clica em um produto que recomendamos, é direcionada para a Amazon</li>
                  <li>Se decidir comprar, recebemos uma pequena comissão (sem custo extra para você!)</li>
                  <li>Essa comissão nos ajuda a manter o site funcionando e criar mais conteúdo útil</li>
                  <li>Você sempre compra com toda a segurança e garantia da Amazon</li>
                </ul>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-4 font-medium">
                  💡 Transparência total: só recomendamos produtos que realmente acreditamos que podem ajudar você!
                </p>
              </div>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                🍪 Sobre os Cookies (Os Pequenos Ajudantes Digitais)
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Os cookies são pequenos arquivos que ajudam o site a funcionar melhor para você. No Karooma, 
                usamos cookies para:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4 mb-4">
                <li>Lembrar suas preferências e melhorar sua experiência de navegação</li>
                <li>Identificar quando você clica em links de produtos (para o programa de afiliados)</li>
                <li>Entender quais conteúdos são mais úteis para vocês, mães</li>
                <li>Garantir que o site funcione corretamente em todos os dispositivos</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Você pode desativar os cookies no seu navegador a qualquer momento, mas isso pode afetar 
                algumas funcionalidades do site.
              </p>
            </section>

            {/* Informações Pessoais */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                📧 Suas Informações Pessoais
              </h2>
              <div className="bg-pink-50 dark:bg-pink-900/20 p-6 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Coletamos informações apenas quando você escolhe compartilhar conosco:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4 mb-4">
                  <li><strong>Newsletter:</strong> Seu email para enviarmos dicas exclusivas (você pode cancelar quando quiser!)</li>
                  <li><strong>Formulário de contato:</strong> Nome e email para podermos responder suas dúvidas</li>
                  <li><strong>Comentários:</strong> Nome para identificar sua participação na comunidade</li>
                </ul>
                <p className="text-pink-600 dark:text-pink-400 font-medium">
                  🔒 Promessa: Seus dados ficam seguros conosco e NUNCA são vendidos para terceiros!
                </p>
              </div>
            </section>

            {/* Segurança */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                🛡️ Como Protegemos Seus Dados
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Assim como você protege sua família, nós protegemos suas informações com medidas de segurança 
                adequadas. Utilizamos tecnologias confiáveis para evitar acessos não autorizados e mantemos 
                seus dados sempre seguros.
              </p>
            </section>

            {/* Links Externos */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                🔗 Links para Outros Sites
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Nosso site contém links para a Amazon e outros sites úteis. Lembramos que cada site tem 
                suas próprias políticas de privacidade, então recomendamos que você dê uma olhadinha nas 
                políticas deles também, combinado?
              </p>
            </section>

            {/* Consentimento */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                ✅ Seu Consentimento
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Ao continuar navegando no Karooma, você concorda com o uso de cookies e com os termos 
                desta Política de Privacidade. Estamos sempre aqui se você tiver qualquer dúvida!
              </p>
            </section>

            {/* Alterações */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                🔄 Atualizações desta Política
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Assim como a maternidade, nossa política pode evoluir. Sempre que fizermos mudanças importantes, 
                avisaremos você. Recomendamos dar uma olhadinha aqui de vez em quando para ficar sempre informada.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                💬 Ainda tem dúvidas?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Sabemos que às vezes essas questões legais podem parecer complicadas. Se você tiver 
                qualquer dúvida sobre nossa Política de Privacidade, não hesite em nos contatar! 
                Estamos aqui para ajudar.
              </p>
              <Link 
                href="/contato"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors font-medium"
              >
                Entre em Contato 💜
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-purple-600 dark:text-purple-400 hover:underline">
              ← Voltar para o início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}