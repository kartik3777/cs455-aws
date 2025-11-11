
import React, {useState, useEffect} from 'react'

const Search = () => {
      const [source, setSource] = useState("");
      const [destination, setDestination] = useState("");
      const [date, setDate] = useState("");
      const handleClick = () => {
        
      }
  return (
    <div className="search-section">
        <input placeholder="Source" value={source} onChange={(e) => setSource(e.target.value)} />
        <input placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button onClick={handleClick}>Search</button>
      </div>
  )
}

export default Search
