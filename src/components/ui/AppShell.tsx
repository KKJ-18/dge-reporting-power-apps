import { ReactNode } from 'react';

interface AppShellProps {
  sidebar: ReactNode;
  children: ReactNode;
  debugPanel?: ReactNode;
  sidebarCollapsed?: boolean;
}

const AppShell: React.FC<AppShellProps> = ({ sidebar, children, debugPanel, sidebarCollapsed }) => {
  return (
    <div className={`ui-app-shell ${sidebarCollapsed ? 'ui-app-shell--collapsed' : ''}`}>
      {sidebar}
      <main className="ui-app-shell__main">
        {children}
        {debugPanel}
      </main>
    </div>
  );
};

export default AppShell;
