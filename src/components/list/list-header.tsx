import React from 'react';

interface Props {
  title: string;
  description: string;
  rightSection?: React.ReactNode;
}

const ListHeader = ({ title, description, rightSection }: Props) => {
  return (
    <header
      className={
        'flex flex-wrap items-center justify-between gap-3 max-md:flex-col max-md:text-center'
      }
    >
      <div className={'flex flex-col max-md:gap-1'}>
        <h1 className={'text-2xl font-bold'}>{title}</h1>
        <div className={'text-muted-foreground text-xs'}>{description}</div>
      </div>

      {rightSection}
    </header>
  );
};

export default ListHeader;
