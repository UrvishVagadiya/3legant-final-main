interface AdminTableProps {
  headers: string[];
  children: React.ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export default function AdminTable({
  headers,
  children,
  emptyMessage = "No data found",
  isEmpty = false,
}: AdminTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-[#6C7275]">
            <tr>
              {headers.map((h) => (
                <th key={h} className="text-left px-6 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {children}
            {isEmpty && (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-6 py-12 text-center text-[#6C7275]"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
