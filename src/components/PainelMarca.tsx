// Painel de marca exibido ao lado dos formulários de login e cadastro.
// Só aparece em telas largas; no celular a logo vai no topo do formulário.
export default function PainelMarca() {
  return (
    <aside className="painel-marca relative hidden flex-col justify-between overflow-hidden border-r border-zinc-800 p-12 lg:flex">
      <img
        src="/logo-horizontal.svg"
        alt="Game Case"
        width={179}
        height={60}
        className="h-11 w-auto self-start"
      />

      <div>
        <img
          src="/simbolo.svg"
          alt=""
          width={320}
          height={320}
          className="mb-10 w-64 xl:w-80"
        />
        <h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-zinc-50 xl:text-5xl">
          Sua coleção de jogos,{' '}
          <span className="text-violet-400">organizada.</span>
        </h2>
        <p className="mt-4 max-w-md text-lg text-zinc-400">
          Física ou digital, todos os seus jogos em um só lugar e salvos na
          nuvem.
        </p>
      </div>

      <p className="text-sm text-zinc-500">© Game Case</p>
    </aside>
  );
}
