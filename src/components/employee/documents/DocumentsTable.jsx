import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle,
  faClock,
  faTimesCircle,
  faEllipsisV
} from '@fortawesome/free-solid-svg-icons';

const DocumentsTable = ({ documents, loading }) => {
  if (loading) {
    return <div className="text-center py-8">Loading documents...</div>;
  }

  if (documents.length === 0) {
    return <div className="text-center py-8">No documents found</div>;
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Verified':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
      case 'Pending':
        return <FontAwesomeIcon icon={faClock} className="text-yellow-500" />;
      case 'Failed':
        return <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date uploaded</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded by</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File size</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td className="px-6 py-4 whitespace-nowrap font-medium">{doc.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{doc.category}</td>
              <td className="px-6 py-4 whitespace-nowrap">{doc.uploadDate}</td>
              <td className="px-6 py-4 whitespace-nowrap">{doc.uploadedBy}</td>
              <td className="px-6 py-4 whitespace-nowrap">{doc.fileSize}</td>
              <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                {getStatusIcon(doc.status)}
                <span>{doc.status}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button className="text-gray-500 hover:text-gray-700">
                  <FontAwesomeIcon icon={faEllipsisV} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentsTable;