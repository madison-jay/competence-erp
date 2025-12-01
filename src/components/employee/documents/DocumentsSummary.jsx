import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileAlt,
  faFileInvoiceDollar,
  faFileContract,
  faCertificate,
  faIdCard,
  faUserCircle
} from '@fortawesome/free-solid-svg-icons';

const getCategoryIcon = (categoryName) => {
  switch(categoryName) {
    case 'official documents':
      return <FontAwesomeIcon icon={faFileAlt} className="text-[#969393] text-4xl mb-4" />;
    case 'payslips':
      return <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-[#969393] text-4xl mb-4" />;
    case 'contracts':
      return <FontAwesomeIcon icon={faFileContract} className="text-[#969393] text-4xl mb-4" />;
    case 'certificates':
      return <FontAwesomeIcon icon={faCertificate} className="text-[#969393] text-4xl mb-4" />;
    case 'ids':
      return <FontAwesomeIcon icon={faIdCard} className="text-[#969393] text-4xl mb-4" />;
    case 'Uploaded by me':
      return <FontAwesomeIcon icon={faUserCircle} className="text-[#969393] text-4xl mb-4" />;
    default:
      return <FontAwesomeIcon icon={faFileAlt} className="text-[#969393] text-4xl mb-4" />;
  }
};

const DocumentsSummary = ({ categories, activeFilter, onFilterChange, loading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      {categories.map((category) => (
        <div 
          key={category.name}
          className={`p-4 border-[0.5px] border-solid border-[#DDD9D9] rounded-lg cursor-pointer transition-colors ${
            activeFilter === category.name ? 'bg-orange-50 border-orange-200' : 'hover:bg-gray-50'
          }`}
          onClick={() => onFilterChange(category.name)}
        >
          <div className="flex items-start flex-col">
            {getCategoryIcon(category.name)}
            <h3 className="font-medium text-lg text-[#070000] capitalize">{category.name}</h3>
          </div>
          <p className="text-gray-500">
            {loading ? '-' : `${category.count} files`}
          </p>
        </div>
      ))}
    </div>
  );
};

export default DocumentsSummary;