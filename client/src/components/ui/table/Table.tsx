import React from 'react';

interface TableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessor: keyof T;
    render?: (value: any, item: T) => React.ReactNode;
  }[];
}

export function Table<T>({ data, columns }: TableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider first:rounded-tl-xl last:rounded-tr-xl"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, rowIndex) => (
              <tr 
                key={rowIndex}
                className={rowIndex === data.length - 1 ? 'last-row' : ''}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={`${rowIndex}-${colIndex}`}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500
                      ${rowIndex === data.length - 1 ? 'last-row' : ''}
                      ${rowIndex === data.length - 1 && colIndex === 0 ? 'rounded-bl-xl' : ''}
                      ${rowIndex === data.length - 1 && colIndex === columns.length - 1 ? 'rounded-br-xl' : ''}
                    `}
                  >
                    {column.render
                      ? column.render(item[column.accessor], item)
                      : String(item[column.accessor])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 