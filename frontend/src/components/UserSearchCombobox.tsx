'use client';

import * as React from 'react';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { useAllCandidates } from '@/hooks/useCandidate';

interface UserSearchComboboxProps {
  onUserSelect: (userId: string) => void;
  selectedUserId?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Mock candidate data for testing and fallback
const mockCandidates = [
  { id: '1', fullName: 'John Doe', email: 'john@example.com' },
  { id: '2', fullName: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', fullName: 'Michael Johnson', email: 'michael@example.com' },
  { id: '4', fullName: 'Emily Davis', email: 'emily@example.com' },
  { id: '5', fullName: 'Robert Wilson', email: 'robert@example.com' },
];

export function UserSearchCombobox({
  onUserSelect,
  selectedUserId,
  placeholder = 'Search for a candidate...',
  className,
  disabled = false,
}: UserSearchComboboxProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  
  // Use the useAllCandidates hook to get all candidates at once
  const { data: allCandidatesData, isLoading, error: fetchError } = useAllCandidates(100);
  console.log(allCandidatesData, "allCandidatesData")

  // Handle fetch errors
  React.useEffect(() => {
    if (fetchError) {
      console.error('Fetch candidates error:', fetchError);
      setError('Error fetching candidates. Using mock data instead.');
    } else {
      setError(null);
    }
  }, [fetchError]);

  // Get all available candidates
  const allCandidates = React.useMemo(() => {
    if (allCandidatesData?.candidates && allCandidatesData.candidates.length > 0 && !fetchError) {
      return allCandidatesData.candidates || [];
    }
    return mockCandidates;
  }, [allCandidatesData, fetchError]);

  // Filter candidates based on search query
  const filteredCandidates = React.useMemo(() => {
    if (!searchQuery) return allCandidates;
    
    const lowerQuery = searchQuery.toLowerCase();
    return allCandidates.filter(candidate => {
      const name = (candidate.fullName || '').toLowerCase();
      const email = (candidate.email || '').toLowerCase();
      return name.includes(lowerQuery) || email.includes(lowerQuery);
    });
  }, [allCandidates, searchQuery]);

  // Transform the filtered candidates into options for the combobox
  const candidateOptions: ComboboxOption[] = React.useMemo(() => {
    return filteredCandidates.map((candidate) => ({
      value: candidate.id,
      label: candidate.fullName || candidate.email,
    }));
  }, [filteredCandidates]);

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
    console.log('All candidates:', allCandidates);
    console.log('Filtered candidates:', filteredCandidates);
    console.log('Candidate options:', candidateOptions);
  }, [searchQuery, allCandidates, filteredCandidates, candidateOptions]);

  return (
    <div className={className}>
      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
      <Combobox
        options={candidateOptions}
        value={selectedUserId}
        onValueChange={handleSelectionChange}
        onInputChange={handleInputChange}
        placeholder={placeholder}
        emptyMessage={isLoading ? 'Loading...' : 'No candidates found'}
        disabled={disabled}
      />
    </div>
  );
}