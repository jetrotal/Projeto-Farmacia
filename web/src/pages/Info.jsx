import { useEffect, useState } from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { ApiService } from '../services/api';

export default function Info() {
  const { route, navigate } = useNavigation();
  const title = route.params?.title || 'Central de Ajuda';
  const [pageData, setPageData] = useState(null);
  const [allPages, setAllPages] = useState([]);

  useEffect(() => {
    ApiService.getPageByTitle(title)
      .then(setPageData)
      .catch(() => {
        setPageData({
          title,
          content: `Conteúdo institucional de ${title}.`,
        });
      });

    ApiService.getPages()
      .then((list) => setAllPages(Array.isArray(list) ? list : []))
      .catch(() => {});
  }, [title]);

  return (
    <div className="page-info">
      <div className="info-card">
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '24px',
          }}
        >
          {allPages.map((p) => (
            <button
              key={p.id || p.slug}
              type="button"
              className={`category-pill ${p.title === title ? 'active' : ''}`}
              style={{ padding: '8px 16px', fontSize: '12px' }}
              onClick={() => navigate('info', { title: p.title })}
            >
              {p.title}
            </button>
          ))}
        </div>

        <h1 className="info-title">{pageData?.title || title}</h1>
        <div className="info-content" style={{ whiteSpace: 'pre-line' }}>
          {pageData ? pageData.content : 'Carregando conteúdo do CMS...'}
        </div>
      </div>
    </div>
  );
}
