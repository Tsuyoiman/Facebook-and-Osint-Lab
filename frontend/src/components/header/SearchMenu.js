import { Return, Search } from "../../svg";
import useClickOutside from "../../helpers/clickOutside";
import axios from "axios";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
export default function SearchMenu({ color, setShowSearchMenu }) {
  const [iconVisible, setIconVisible] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchError, setSearchError] = useState("");
  const menu = useRef(null);
  const input = useRef(null);
  useClickOutside(menu, () => {
    setShowSearchMenu(false);
  });
  useEffect(() => {
    input.current.focus();
  }, []);
  useEffect(() => {
    const value = query.trim();
    if (value.length < 2) {
      setResults([]);
      setSearchError("");
      return undefined;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/searchUsers`,
          { params: { q: value } }
        );
        setResults(data);
        setSearchError("");
      } catch (error) {
        setResults([]);
        setSearchError("Search is unavailable right now.");
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);
  return (
    <div className="header_left search_area scrollbar" ref={menu}>
      <div className="search_wrap">
        <div className="header_logo">
          <div
            className="circle hover1"
            onClick={() => {
              setShowSearchMenu(false);
            }}
          >
            <Return color={color} />
          </div>
        </div>
        <div
          className="search"
          onClick={() => {
            input.current.focus();
          }}
        >
          {iconVisible && (
            <div>
              <Search color={color} />
            </div>
          )}

          <input
            type="text"
            placeholder="Search classroom profiles"
            ref={input}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => {
              setIconVisible(false);
            }}
            onBlur={() => {
              setIconVisible(true);
            }}
          />
        </div>
      </div>
      <div className="search_history_header">
        <span>{query.trim() ? "Public profiles" : "Search the classroom lab"}</span>
      </div>
      <div className="search_results scrollbar">
        {searchError && <div className="search_empty">{searchError}</div>}
        {!searchError && query.trim().length >= 2 && results.length === 0 && (
          <div className="search_empty">No fictional profiles found.</div>
        )}
        {results.map((result) => (
          <Link
            to={`/profile/${result.username}`}
            className="search_result"
            key={result._id}
            onClick={() => setShowSearchMenu(false)}
          >
            <img src={result.picture} alt="" />
            <span>
              <strong>{result.first_name} {result.last_name}</strong>
              <small>@{result.username}</small>
              <small>{result.simulation?.occupation || "Classroom participant"}</small>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
