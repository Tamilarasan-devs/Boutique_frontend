import React from 'react';

const SalesReport: React.FC = () => {
  return (
    <div className="flex flex-col h-full space-y-4 p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">SalesReport</h1>
          <nav className="text-sm text-gray-500 mt-1">
            <span>Home</span> <span className="mx-2">/</span> <span>SalesReport</span>
          </nav>
        </div>
        
        {/* Toolbar & Action Buttons */}
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Export
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
            Create New
          </button>
        </div>
      </div>

      {/* Filter Area & Search */}
      <div className="flex justify-between items-center py-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex w-1/3">
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex space-x-2">
          <select className="px-4 py-2 border border-gray-300 rounded-md bg-white">
            <option>All Filters</option>
            <option>Active</option>
            <option>Archived</option>
          </select>
        </div>
      </div>

      {/* Table/Card Area */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-100 p-8 flex items-center justify-center min-h-[400px]">
        {/* Empty State */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No data found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new entry.</p>
          <div className="mt-6">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
              New Entry
            </button>
          </div>
        </div>
      </div>

      {/* Pagination Placeholder */}
      <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 sm:px-6 rounded-lg mt-4">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of <span className="font-medium">97</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Previous
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                1
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 z-50">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

export default SalesReport;
