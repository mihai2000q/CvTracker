import React from 'react';

interface Props {
  title: string;
  description: string;
  rightSection?: React.ReactNode;
}

const ListHeader = ({ title, description, rightSection }: Props) => {
  return (
    <header className={'max-md:flex-col max-md:text-center flex flex-wrap items-center justify-between gap-3'}>
      <div className={'max-md:gap-1 flex flex-col'}>
        <h1 className={'text-2xl font-bold'}>{title}</h1>
        <div className={'text-muted-foreground text-xs'}>{description}</div>
      </div>

      {rightSection}
    </header>
  );
};

export default ListHeader;
