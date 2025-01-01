import { useState, FormEvent } from "react";
import { Search as SearchIcon } from "lucide-react"; 
import useGetAllUsers from "./context/useGetAllUsers";
import useConversation from "./context/useConversation";
import toast from "react-hot-toast";



function Search() {
  const [search, setSearch] = useState<string>(""); 
  const [allUsers] : any = useGetAllUsers(); 
  const { setSelectedConversation } : any = useConversation();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!Array.isArray(allUsers)) {
        toast.error("No users available to search.");
        return;
    }


    if (!search) return;

    const conversation = allUsers.find((user) =>
      user.username?.toLowerCase().includes(search.toLowerCase())
    );

    if (conversation) {
      setSelectedConversation(conversation);
      setSearch("");
    } else {
      toast.error("User not found");
    }
  };

  return (
    <div className="h-[10vh]">
      <div className="px-6 py-4">
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-3">
            <label className="border-[1px] border-gray-700 bg-slate-900 rounded-lg p-3 flex items-center gap-2 w-[80%]">
              <input
                type="text"
                className="grow outline-none bg-transparent"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <button
              type="submit"
              className="flex items-center justify-center text-gray-400 hover:text-white duration-300"
            >
              <SearchIcon className="h-8 w-8 p-1 hover:bg-gray-600 rounded-full duration-300" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Search;
