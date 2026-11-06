import React from 'react';

interface MainContentContainerProps {
  children: React.ReactNode;
}

export const MainContentContainer: React.FC<MainContentContainerProps> = ({ children }) => {
  return <main className="flex-1">{children}</main>;
};
