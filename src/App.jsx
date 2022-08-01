
import { useMutation, useInfiniteQuery, useQueryClient } from 'react-query'
// import { useMutation, useQuery, useQueryClient } from 'react-query'
import './App.css'

// Fetch API
//useInfiniteQuery 
const fetchInfiniteUsers = async ({ pageParam = 1 }) => {
  const response = await fetch(`https://reqres.in/api/users?page=${pageParam}`)
  if (!response.ok) {
    throw new Error('Something went wrong!')
  }
  return response.json();
};

//useQuery
// const fetchUsers = async () => {
//   const response = await fetch('https://reqres.in/api/users')
//   if (!response.ok) {
//     throw new Error('Something went wrong!')
//   }
//   return response.json();
// };

//
const addUser = async user  => {
  const response = await fetch('https://reqres.in/api/users', {
    method: 'POST',
    body: JSON.stringify({
      first_name: user.first_name,
      last_name: user.last_name
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  });

  if(!response.ok) {
    throw new Error('Something went wrong!')
  }

  return response.json()
}

function App() {
  //Call the useQueryClient hook
  const queryClient = useQueryClient()

  // Grab all user
  const { data: users, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, error } = useInfiniteQuery(['users'], fetchInfiniteUsers , {
    getNextPageParam: (lastPage, pages) => {
      if(lastPage.page < lastPage.total_pages) return lastPage.page + 1
      return false
    }
  })
  console.log(users, hasNextPage)
  // const { data: users, isLoading, error,} = useQuery(['users'], fetchUsers, {enabled: true, refetchOnWindowFocus: false, refecthInterval: false});

  //Create a mutation for adding a user
  const { mutate, mutateAsync, isLoading: isAddingUser, error: addError } = useMutation(addUser, {
    onSuccess: (newData) => {
      console.log(newData)
      // queryClient.invalidateQueries(['users'])
      queryClient.setQueryData(['users'], oldData => ({
        ...oldData,
        data: [newData, ...oldData.data]
      }))
    }
  })

    //Create a mutation for adding a user with mutateAsync
    // const { mutate, mutateAsync, isLoading: isAddingUser, error: addError } = useMutation(addUser)


    // const handleAddUser = async () => {
    //   const data= await mutateAsync({ first_name: 'React Query', last_name: 'Rules!' })
    //   console.log(data)
    //   refetch()
    // }

  if (isLoading) return <p>Loading ...</p>
  if (error || addError) return <p>Something went wrong ...</p>

  return (
    <div className='App'>
      {isAddingUser ? <p>Adding user...</p> : null}
      {users.pages.map(page =>(
        page.data.map(user => (
          <p key={user.id}>
            {user.first_name} {user.last_name}
          </p>
        ))
      ))}
      {isFetchingNextPage && <p>Loading fetching...</p>}
      {hasNextPage && <button onClick={fetchNextPage}> Load More </button>}
      {/* useQuery
      {users.data.map(user => (
        <p key={user.id}>
          {user.first_name} {user.last_name}
        </p>
      ))} */}
      <button onClick={() => mutate({ first_name: 'React Query', last_name: 'Rules!' })}> Add User </button>
      {/* <button onClick={handleAddUser}> Add User </button> */}
    </div>
  )
}

export default App
