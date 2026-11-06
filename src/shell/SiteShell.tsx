import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MainContentContainer } from './MainContentContainer';
import { SearchDialog } from './SearchDialog';

export interface SiteShellProps {
  currentArticle: string | null;
  isSearchOpen: boolean;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onNavigateHome: (categoryId?: string) => void;
  onSelectArticle: (path: string) => void;
  children: React.ReactNode;
}

export const SiteShell: React.FC<SiteShellProps> = ({
  currentArticle,
  isSearchOpen,
  onOpenSearch,
  onCloseSearch,
  onNavigateHome,
  onSelectArticle,
  children,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink selection:bg-forest/15 selection:text-ink">
      <Header
        currentArticle={currentArticle}
        onOpenSearch={onOpenSearch}
        onNavigateHome={onNavigateHome}
        onSelectArticle={onSelectArticle}
      />

      <div className="flex-1 flex flex-col">
        <MainContentContainer>{children}</MainContentContainer>
      </div>

      <Footer
        onNavigateHome={() => onNavigateHome()}
        onSelectArticle={onSelectArticle}
        onOpenSearch={onOpenSearch}
      />

      <SearchDialog
        isOpen={isSearchOpen}
        onClose={onCloseSearch}
        onSelectArticle={onSelectArticle}
      />
    </div>
  );
};
