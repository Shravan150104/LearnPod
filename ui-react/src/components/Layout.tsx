interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabSelect: (tab: string) => void;
}

export function Layout({ children, activeTab, onTabSelect }: LayoutProps) {
  const navItem = (id: string, icon: string, label: string) => {
    const isActive = activeTab === id;
    if (isActive) {
      return (
        <button
          key={id}
          onClick={() => onTabSelect(id)}
          className="text-[#00E3FD] font-bold bg-[#1F1F22] rounded-l-full ml-4 pl-4 py-3 flex items-center gap-4 w-full text-left"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
          <span className="font-['Inter'] tracking-[-0.02em]">{label}</span>
        </button>
      );
    }
    return (
      <button
        key={id}
        onClick={() => onTabSelect(id)}
        className="text-[#CBC3D9] hover:text-[#CDBDFF] px-8 py-3 transition-colors flex items-center gap-4 group w-full text-left"
      >
        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">{icon}</span>
        <span className="font-['Inter'] tracking-[-0.02em]">{label}</span>
      </button>
    );
  };

  return (
    <div className="antialiased overflow-hidden">
      {/* SideNavBar Shell — exact copy from Stitch */}
      <aside className="h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-[#1B1B1E] border-none shadow-[48px_0px_48px_rgba(0,0,0,0.2)] flex flex-col py-8 gap-y-2 z-50">
        <div className="px-8 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-button flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-[#E4E1E6]">LearnPod</h1>
              <p className="text-[10px] uppercase tracking-widest text-secondary font-bold">AI Studio</p>
            </div>
          </div>
        </div>
        <nav className="flex-1">
          {navItem('create', 'add_circle', 'Create')}
          {navItem('studio', 'mic', 'Studio')}
          {navItem('settings', 'settings', 'Settings')}
        </nav>
      </aside>



      {/* Main Content */}
      {children}
    </div>
  );
}
