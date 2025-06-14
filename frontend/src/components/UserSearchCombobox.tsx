'use client';

import * as React from 'react';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { useAllUsers } from '@/hooks/useUser';

interface UserSearchComboboxProps {
  onUserSelect: (userId: string) => void;
  selectedUserId?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Mock user data for testing and fallback
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Michael Johnson', email: 'michael@example.com' },
  { id: '4', name: 'Emily Davis', email: 'emily@example.com' },
  { id: '5', name: 'Robert Wilson', email: 'robert@example.com' },
];

export function UserSearchCombobox({
  onUserSelect,
  selectedUserId,
  placeholder = 'Search for a user...',
  className,
  disabled = false,
}: UserSearchComboboxProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  
  // Use the useAllUsers hook to get all users at once
  const { data: allUsersData, isLoading, error: fetchError } = useAllUsers(100);
  console.log(allUsersData, "allUsersData")

  // Handle fetch errors
  React.useEffect(() => {
    if (fetchError) {
      console.error('Fetch users error:', fetchError);
      setError('Error fetching users. Using mock data instead.');
    } else {
      setError(null);
    }
  }, [fetchError]);

  // Get all available users
  const allUsers = React.useMemo(() => {
    if (allUsersData?.data && allUsersData.data.length > 0 && !fetchError) {
      return allUsersData.data?.filter((user) => user.role === "USER") || [];
    }
    return mockUsers;
  }, [allUsersData, fetchError]);

  // Filter users based on search query
  const filteredUsers = React.useMemo(() => {
    if (!searchQuery) return allUsers;
    
    const lowerQuery = searchQuery.toLowerCase();
    return allUsers.filter(user => {
      const name = (user.name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      return name.includes(lowerQuery) || email.includes(lowerQuery);
    });
  }, [allUsers, searchQuery]);

  // Transform the filtered users into options for the combobox
  const userOptions: ComboboxOption[] = React.useMemo(() => {
    return filteredUsers.map((user) => ({
      value: user.id,
      label: user.name || user.email,
    }));
  }, [filteredUsers]);

  // Handle input change for the combobox
  const handleInputChange = React.useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // Handle selection change
  const handleSelectionChange = React.useCallback(
    (value: string) => {
      onUserSelect(value);
    },
    [onUserSelect]
  );

  // Log for debugging
  React.useEffect(() => {
    console.log('Search query:', searchQuery);
    console.log('All users:', allUsers);
    console.log('Filtered users:', filteredUsers);
    console.log('User options:', userOptions);
  }, [searchQuery, allUsers, filteredUsers, userOptions]);

  return (
    <div className={className}>
      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
      <Combobox
        options={userOptions}
        value={selectedUserId}
        onValueChange={handleSelectionChange}
        onInputChange={handleInputChange}
        placeholder={placeholder}
        emptyMessage={isLoading ? 'Loading...' : 'No users found'}
        disabled={disabled}
      />
    </div>
  );
}