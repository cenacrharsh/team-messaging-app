import React, { useEffect, useState } from "react";
import { Avatar, useChatContext } from "stream-chat-react";

import { InviteIcon } from "../assets";

//* ALL REACT FUNCTIONAL COMPONENTS HAVE ACCESS TO A PROP CALLED CHILDREN, WHATEVER COMPONENTS WE RENDER IN THE FUNCTION IT WILL BE POPULATED INTO THE CHILDREN PROP
const ListContainer = ({ children }) => {
  return (
    <div className="user-list__container">
      <div className="user-list__header">
        <p>User</p>
        <p>Invite</p>
      </div>
      {children}
    </div>
  );
};

const UserItem = ({ user, setSelectedUsers }) => {
  const [selected, setSelected] = useState(false);

  const handleSelect = () => {
    //* SELECT ALL THE USERS THAT HAVE BEEN SELECTED
    if (selected) {
      /* FILTER THE USER IF IT'S UNSELECTED ( i.e. CLICKED AGAIN ) */
      setSelectedUsers((prevUsers) =>
        prevUsers.filter((prevUser) => prevUser !== user.id)
      );
    } else {
      /* ADDING THE RECENTLY CLICKED USER TO LIST OF ALL USERS THAT HAVE BEEN SELECTED */
      setSelectedUsers((prevUsers) => [...prevUsers, user.id]);
    }

    setSelected((prevSelected) => !prevSelected);
  };

  return (
    <div className="user-item__wrapper" onClick={handleSelect}>
      <div className="user-item__name-wrapper">
        <Avatar image={user.image} name={user.fullName || user.id} size={32} />
        <p className="user-item__name">{user.fullName || user.id}</p>
      </div>
      {selected ? <InviteIcon /> : <div className="user-item__invite-empty" />}
    </div>
  );
};

const UserList = ({ setSelectedUsers }) => {
  const { client } = useChatContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listEmpty, setListEmpty] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const getUsers = async () => {
      if (loading) return;

      setLoading(true);

      try {
        //* GET ALL USERS EXCEPT THE ONE CURRENTLY LOGGED IN ( $ne => NOT EQUAL TO )
        const response = await client.queryUsers(
          { id: { $ne: client.userID } },
          { id: 1 },
          { limit: 8 }
        );

        if (response.users.length) {
          setUsers(response.users);
        } else {
          setListEmpty(true);
        }
      } catch (error) {
        setError(true);
      }

      setLoading(false);
    };

    if (client) getUsers();

    // eslint-disable-next-line
  }, []);

  //* ERROR STATE
  if (error) {
    return (
      <ListContainer>
        <div className="user-list__message">
          Error Loading, Please Refresh & Try Again.
        </div>
      </ListContainer>
    );
  }

  //* EMPTY STATE
  if (listEmpty) {
    return (
      <ListContainer>
        <div className="user-list__message">No Users Found.</div>
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      {loading ? (
        <div className="user-list__message">Loading Users...</div>
      ) : (
        users?.map((user, i) => (
          <UserItem
            index={i}
            key={user.id}
            user={user}
            setSelectedUsers={setSelectedUsers}
          />
        ))
      )}
    </ListContainer>
  );
};

export default UserList;
