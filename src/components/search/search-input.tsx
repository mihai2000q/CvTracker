'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { RiSearchLine } from '@remixicon/react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';
import { useDebouncedValue } from '@/hooks/use-debounced-value.ts';

interface Props {
  search: string;
  onSearch: (search: string) => void;
  isPending?: boolean;
  placeholder?: string;
  className?: string;
}

const SearchInput = ({ search, onSearch, isPending, placeholder, className }: Props) => {
  const [value, setValue] = useState(search);
  const [internalSearch, setInternalSearch] = useState(search);
  const debounced = useDebouncedValue(value.trim());

  if (search !== internalSearch) {
    setInternalSearch(search);
    if (search !== debounced) setValue(search);
  }

  useEffect(() => {
    if (debounced !== search) onSearch(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <InputGroup className={className}>
      <InputGroupAddon>{isPending ? <Spinner /> : <RiSearchLine />}</InputGroupAddon>
      <InputGroupInput
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
      />
    </InputGroup>
  );
};

export default SearchInput;
