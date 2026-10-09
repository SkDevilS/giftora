import { Link } from 'react-router-dom';

const Breadcrumbs = ({ items }) => {
  return (
    <nav className="text-sm text-gray-600 mb-6">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <span className="mx-2">/</span>}
            {item.link ? (
              <Link to={item.link} className="hover:text-primary-600 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

