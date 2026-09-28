import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Dots } from "../../svg";
import AddFriendSmallCard from "./AddFriendSmallCard";

// Suggests real fictional users from the database. This used to render a
// hardcoded list (Elon Musk, South Park, ...) whose "Add Friend" control was a
// non-interactive <div>, so nothing ever happened when it was clicked.
export default function PplYouMayKnow() {
  const { user } = useSelector((state) => ({ ...state }));
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!user?.token) return;
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/suggestUsers`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        if (!cancelled) {
          setSuggestions(
            (data || []).map((person) => ({
              _id: person._id,
              username: person.username,
              profile_picture: person.picture,
              profile_name: `${person.first_name} ${person.last_name}`,
            }))
          );
        }
      } catch (error) {
        console.error("Could not load suggestions", error);
        if (!cancelled) setSuggestions([]);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user?.token]);

  return (
    <div className="pplumayknow">
      <div className="pplumayknow_header">
        People you may know
        <div className="post_header_right ppl_circle hover1">
          <Dots />
        </div>
      </div>
      <div className="pplumayknow_list">
        {suggestions.map((person) => (
          <AddFriendSmallCard item={person} key={person._id} />
        ))}
      </div>
    </div>
  );
}
