function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div className="relative w-full max-w-md">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder="İlan ara..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="input pl-9 w-full text-sm"
      />
    </div>
  )
}

export default SearchBar