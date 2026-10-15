import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { demographicsApi } from '../../../api/demographics';
import { Download, Search, RefreshCw } from 'lucide-react';
import './RawSurveyDataTab.css';

export const RawSurveyDataTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all households to get the raw 'meta' data
  const { data: households, isLoading, isError, refetch } = useQuery({
    queryKey: ['raw-survey-households'],
    queryFn: () => demographicsApi.getHouseholds(),
  });

  // Extract all unique keys from all meta objects
  const { columns, rows } = useMemo(() => {
    if (!households || households.length === 0) return { columns: [], rows: [] };

    // Set to store unique keys
    const keysSet = new Set<string>();
    
    // Default columns we always want first
    const defaultCols = ['_id', 'wardNumber', 'householdName', 'contactPhone'];
    defaultCols.forEach(col => keysSet.add(col));

    const processedRows = households.map((hh) => {
      const rowData: Record<string, any> = {
        _id: hh.id,
        wardNumber: hh.wardNumber,
        householdName: hh.householdName,
        contactPhone: hh.contactPhone || '',
      };

      if (hh.meta) {
        Object.keys(hh.meta).forEach((key) => {
          // Ignore complex nested objects if any, mostly Kobo data is flat or stringified
          if (typeof hh.meta![key] !== 'object' || hh.meta![key] === null) {
            keysSet.add(key);
            rowData[key] = hh.meta![key];
          } else {
             // For arrays or nested objects, JSON stringify them to show in table
             keysSet.add(key);
             rowData[key] = JSON.stringify(hh.meta![key]);
          }
        });
      }
      return rowData;
    });

    const finalCols = Array.from(keysSet);

    return { columns: finalCols, rows: processedRows };
  }, [households]);

  // Filter rows
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const lowerQuery = searchTerm.toLowerCase();
    return rows.filter((row) => {
      // Check if any column value matches the search term
      return columns.some(col => {
        const val = row[col];
        return val && String(val).toLowerCase().includes(lowerQuery);
      });
    });
  }, [rows, searchTerm, columns]);

  // Export to CSV
  const handleExportCsv = () => {
    if (filteredRows.length === 0) return;
    
    // Create CSV Headers
    const headers = columns.join(',');
    
    // Create CSV Rows
    const csvRows = filteredRows.map(row => {
      return columns.map(col => {
        const val = row[col] !== undefined && row[col] !== null ? String(row[col]) : '';
        // Escape quotes and wrap in quotes to handle commas in values
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...csvRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Panchpokhari_Raw_Survey_Data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dt-card raw-data-container">
      <div className="raw-data-header">
        <div>
          <h3 className="raw-data-title">विस्तृत सर्भे डाटा (Raw Survey Data)</h3>
          <p className="raw-data-subtitle">
            KoboToolbox फारमबाट संकलन गरिएका सम्पूर्ण {columns.length} वटा फिल्डहरू।
          </p>
        </div>
        <div className="raw-data-actions">
          <div className="raw-data-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="डाटा खोज्नुहोस्..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="raw-data-search-input"
            />
          </div>
          <button onClick={() => refetch()} className="dt-btn dt-btn-secondary" title="Refresh Data">
            <RefreshCw size={16} className={isLoading ? 'spin-icon' : ''} />
          </button>
          <button onClick={handleExportCsv} className="dt-btn dt-btn-primary">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="raw-data-table-wrapper">
        {isLoading ? (
          <div className="raw-data-loading">डाटा लोड हुँदैछ...</div>
        ) : isError ? (
          <div className="raw-data-error">डाटा लोड गर्न समस्या भयो!</div>
        ) : filteredRows.length === 0 ? (
          <div className="raw-data-empty">कुनै डाटा भेटिएन।</div>
        ) : (
          <table className="raw-data-table">
            <thead>
              <tr>
                <th className="sticky-col">SN</th>
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, idx) => (
                <tr key={row._id || idx}>
                  <td className="sticky-col">{idx + 1}</td>
                  {columns.map((col) => (
                    <td key={`${row._id}-${col}`}>
                      <div className="cell-content" title={String(row[col] || '')}>
                        {row[col] !== undefined && row[col] !== null ? String(row[col]) : '-'}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="raw-data-footer">
        Showing {filteredRows.length} of {rows.length} records
      </div>
    </div>
  );
};
