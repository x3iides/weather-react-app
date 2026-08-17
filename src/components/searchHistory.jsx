import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { formatHistoryDate } from '../utils/helper';

const SearchHistory = ({ history, onItemClick, onItemRemove }) => {
  if (history.length === 0) return null;

  return (
    <div className="history mt-0 md:mt-4">
      <h3 className='text-white text-md font-medium mb-3'>Search History</h3>

      <ul className="space-y-2">
        {history.map((item) => (
          <li
            key={item.id}
            onClick={() => onItemClick(item)}
            className="flex justify-between items-center px-4 py-3 gap-4 cursor-pointer hover:opacity-70 transition"
          >
            <div className="flex items-center justify-between w-full gap-2 md:gap-3 flex-wrap">
              <span className="text-sm font-medium text-white">{item.displayName}</span>
              <span className="text-xs text-gray-300">{formatHistoryDate(item.timestamp)}</span>
            </div>
              
            <button
              onClick={(e) => onItemRemove(item.id, e)}
              className="flex items-center justify-center rounded-full border border-white bg-transparent transition hover:bg-white"
              aria-label="Delete"
            >
              <FontAwesomeIcon icon={faTrashCan} className="text-red-400 text-sm" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchHistory;