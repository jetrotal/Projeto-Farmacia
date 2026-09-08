import { useNavigation } from '../contexts/NavigationContext';

export default function Info() {
  const { route } = useNavigation();
  const title = route.params?.title || 'Página de Informação';

  return (
    <div className="page-info">
      <div className="info-card">
        <h1 className="info-title">{title}</h1>
        <div className="info-content">
          <p>Esta é uma página de conteúdo dinâmico para a seção de <strong>{title}</strong>.</p>
          <br/>
          <p>No futuro, este conteúdo será administrado e buscado diretamente do nosso banco de dados (CMS), garantindo flexibilidade para editarmos nossas políticas, informações de ajuda e outras respostas frequentemente perguntadas.</p>
        </div>
      </div>
    </div>
  );
}
