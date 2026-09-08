import Icon from './Icon';
import { mdiChevronRight } from '@mdi/js';
import { useNavigation } from '../contexts/NavigationContext';

export default function Breadcrumbs({ items }) {
  const { navigate } = useNavigation();

  return (
    <div className="breadcrumbs-section px-80">
      <div className="breadcrumbs">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <span key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span 
                className={isLast ? "active" : "pointer"} 
                onClick={() => !isLast && navigate(item.page, item.params || {})}
              >
                {item.label}
              </span>
              {!isLast && <Icon path={mdiChevronRight} size={0.6} />}
            </span>
          );
        })}
      </div>
    </div>
  );
}
